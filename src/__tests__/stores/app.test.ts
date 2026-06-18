import { useAppStore } from "@/stores/app-store";

describe("AppStore", () => {
  beforeEach(() => {
    useAppStore.setState({ status: "idle", isInitialized: false, error: null });
  });

  it("should start with idle status", () => {
    const { status } = useAppStore.getState();
    expect(status).toBe("idle");
  });

  it("should update status", () => {
    const { setStatus } = useAppStore.getState();

    setStatus("listening");
    expect(useAppStore.getState().status).toBe("listening");

    setStatus("thinking");
    expect(useAppStore.getState().status).toBe("thinking");

    setStatus("executing");
    expect(useAppStore.getState().status).toBe("executing");

    setStatus("speaking");
    expect(useAppStore.getState().status).toBe("speaking");
  });

  it("should set initialized", () => {
    const { setInitialized } = useAppStore.getState();

    setInitialized(true);
    expect(useAppStore.getState().isInitialized).toBe(true);
  });

  it("should set error", () => {
    const { setError } = useAppStore.getState();

    setError("Something went wrong");
    expect(useAppStore.getState().error).toBe("Something went wrong");
    expect(useAppStore.getState().status).toBe("error");
  });

  it("should clear error", () => {
    const { setError, clearError } = useAppStore.getState();

    setError("Something went wrong");
    clearError();

    expect(useAppStore.getState().error).toBeNull();
    expect(useAppStore.getState().status).toBe("idle");
  });
});
