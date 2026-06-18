import { app, BrowserWindow, ipcMain, shell, Tray, Menu, nativeImage, desktopCapturer, screen } from "electron";
import path from "path";
import { getPrisma } from "./modules/db";
import { getAgentRuntime } from "./modules/agent";

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

const isDev = !app.isPackaged;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1280,
    minHeight: 720,
    title: "Little Buddy",
    backgroundColor: "#0A0A0A",
    titleBarStyle: "hiddenInset",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(
      path.join(__dirname, "../renderer/out/index.html")
    );
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

function setupIPC(): void {
  ipcMain.handle("app:version", () => app.getVersion());
  ipcMain.handle("app:quit", () => app.quit());
  ipcMain.handle("app:minimize", () => mainWindow?.minimize());
  ipcMain.handle("app:maximize", () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });
  ipcMain.handle("app:close", () => mainWindow?.close());

  ipcMain.handle("voice:start-listening", async (_event, _options) => {
    mainWindow?.webContents.send("voice:status", "listening");
    return { success: true };
  });

  ipcMain.handle("voice:stop-listening", async () => {
    mainWindow?.webContents.send("voice:status", "idle");
    return { success: true };
  });

  ipcMain.handle("voice:status", async (_event, status: string) => {
    mainWindow?.webContents.send("voice:status", status);
    return { success: true };
  });

  ipcMain.handle("auth:login", async (_event, credentials: { email: string; password: string }) => {
    const prisma = await getPrisma();
    const user = await prisma.user.findUnique({ where: { email: credentials.email } });
    if (!user) throw new Error("Invalid email or password");

    const session = {
      user,
      token: `token_${Date.now()}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
    return session;
  });

  ipcMain.handle("auth:register", async (_event, credentials: { email: string; password: string; name: string }) => {
    const prisma = await getPrisma();
    const existing = await prisma.user.findUnique({ where: { email: credentials.email } });
    if (existing) throw new Error("Email already registered");

    const user = await prisma.user.create({
      data: {
        email: credentials.email,
        name: credentials.name,
      },
    });

    const session = {
      user,
      token: `token_${Date.now()}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
    return session;
  });

  ipcMain.handle("db:conversations:list", async (_event, userId: string) => {
    const prisma = await getPrisma();
    return prisma.conversation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  });

  ipcMain.handle(
    "db:conversations:create",
    async (_event, userId: string, title: string | null, firstMessage: string) => {
      const prisma = await getPrisma();
      return prisma.conversation.create({
        data: {
          userId,
          title,
          messages: {
            create: { role: "user", content: firstMessage },
          },
        },
        include: { messages: true },
      });
    }
  );

  ipcMain.handle("db:conversations:delete", async (_event, id: string) => {
    const prisma = await getPrisma();
    return prisma.conversation.delete({ where: { id } });
  });

  ipcMain.handle("db:memories:list", async (_event, userId: string, category?: string) => {
    const prisma = await getPrisma();
    return prisma.memory.findMany({
      where: {
        userId,
        ...(category ? { category } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
  });

  ipcMain.handle(
    "db:memories:store",
    async (_event, userId: string, content: string, category: string) => {
      const prisma = await getPrisma();
      return prisma.memory.create({
        data: { userId, content, category },
      });
    }
  );

  ipcMain.handle("db:memories:delete", async (_event, id: string) => {
    const prisma = await getPrisma();
    return prisma.memory.delete({ where: { id } });
  });

  ipcMain.handle("db:skills:list", async () => {
    const prisma = await getPrisma();
    return prisma.skill.findMany({ orderBy: { name: "asc" } });
  });

  ipcMain.handle("db:skills:toggle", async (_event, id: string) => {
    const prisma = await getPrisma();
    const skill = await prisma.skill.findUnique({ where: { id } });
    if (!skill) throw new Error("Skill not found");
    return prisma.skill.update({
      where: { id },
      data: { enabled: !skill.enabled },
    });
  });

  ipcMain.handle("agent:process", async (_event, input: string, context?: unknown) => {
    const runtime = await getAgentRuntime();
    if (!runtime.isInitialized()) {
      await runtime.initialize();
    }
    return runtime.processRequest(input, context as Record<string, unknown>);
  });

  ipcMain.handle("agent:status", async () => {
    const runtime = await getAgentRuntime();
    return {
      initialized: runtime.isInitialized(),
      orchestrator: {
        status: runtime.getOrchestrator().getStatus(),
        activeTasks: runtime.getOrchestrator().getActiveTaskCount(),
        queuedTasks: runtime.getOrchestrator().getQueuedTaskCount(),
      },
    };
  });

  ipcMain.handle("agent:initialize", async () => {
    const runtime = await getAgentRuntime();
    await runtime.initialize();
    return { success: true };
  });

  ipcMain.handle("agent:destroy", async () => {
    const runtime = await getAgentRuntime();
    await runtime.destroy();
    return { success: true };
  });

  ipcMain.handle("vision:capture-screen", async (_event, options) => {
    const sources = await desktopCapturer.getSources({
      types: ["screen"],
      thumbnailSize: { width: 1920, height: 1080 },
    });

    const source = sources[options?.displayId || 0];
    if (!source) throw new Error("No display source found");

    const thumbnail = source.thumbnail;
    const rect = options?.region;

    let capturedImage = thumbnail;
    if (rect) {
      capturedImage = thumbnail.crop({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      });
    }

    const format = options?.format || "png";
    const quality = options?.quality || 90;

    let imageData: string;
    if (format === "jpeg") {
      imageData = capturedImage.toJPEG(quality).toString("base64");
    } else {
      imageData = capturedImage.toPNG().toString("base64");
    }

    const size = capturedImage.getSize();

    return {
      id: `capture_${Date.now()}`,
      imageData: `data:image/${format};base64,${imageData}`,
      width: size.width,
      height: size.height,
      timestamp: new Date(),
      format,
      displayId: options?.displayId || 0,
    };
  });

  ipcMain.handle("vision:screen-info", async () => {
    const displays = screen.getAllDisplays();
    const primaryDisplay = screen.getPrimaryDisplay();
    const cursorPoint = screen.getCursorScreenPoint();

    return {
      displays: displays.map((d) => ({
        id: d.id,
        name: d.label || `Display ${d.id}`,
        width: d.size.width,
        height: d.size.height,
        x: d.bounds.x,
        y: d.bounds.y,
        isPrimary: d.id === primaryDisplay.id,
        scaleFactor: d.scaleFactor,
      })),
      primaryDisplay: {
        id: primaryDisplay.id,
        name: primaryDisplay.label || "Primary Display",
        width: primaryDisplay.size.width,
        height: primaryDisplay.size.height,
        x: primaryDisplay.bounds.x,
        y: primaryDisplay.bounds.y,
        isPrimary: true,
        scaleFactor: primaryDisplay.scaleFactor,
      },
      cursorPosition: cursorPoint,
    };
  });

  ipcMain.handle("vision:cursor-position", async () => {
    return screen.getCursorScreenPoint();
  });

  ipcMain.handle("vision:analyze-screen", async (_event, _data) => {
    return {
      description: "Screen analysis completed",
      elements: [],
      textContent: [],
      timestamp: new Date(),
    };
  });

  ipcMain.handle("vision:find-element", async (_event, _options) => {
    return {
      found: false,
      element: undefined,
      alternatives: [],
    };
  });

  ipcMain.handle("vision:read-text", async (_event, _options) => {
    return {
      text: "",
      blocks: [],
      confidence: 0,
    };
  });

  ipcMain.handle("vision:click", async (_event, coords) => {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { x, y } = primaryDisplay.bounds;

    try {
      const robotjs = require("robotjs");
      robotjs.moveMouse(coords.x + x, coords.y + y);
      robotjs.mouseClick();
    } catch (e) {
      console.log("robotjs not available, click simulated at:", coords.x + x, coords.y + y);
    }
    return { success: true };
  });

  ipcMain.handle("vision:type-text", async (_event, data) => {
    try {
      const robotjs = require("robotjs");
      robotjs.typeString(data.text);
    } catch (e) {
      console.log("robotjs not available, typing simulated:", data.text);
    }
    return { success: true };
  });
}

function createTray(): void {
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show Little Buddy",
      click: () => {
        mainWindow?.show();
      },
    },
    {
      label: "Quit",
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setToolTip("Little Buddy");
  tray.setContextMenu(contextMenu);

  tray.on("double-click", () => {
    mainWindow?.show();
  });
}

app.whenReady().then(() => {
  setupIPC();
  createWindow();
  createTray();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
