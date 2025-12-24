class StateManager {
    constructor() {
        this.state = {
            message: "Te quiero",
            isFoggy: false
        };
    }

    setMessage(msg) {
        if (msg && msg.trim() !== "") {
            this.state.message = msg;
        }
    }

    getMessage() {
        return this.state.message;
    }
}

export const stateManager = new StateManager();
