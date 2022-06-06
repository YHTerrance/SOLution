import { STATUS } from "@/const";
import { defineStore } from "pinia";

export const useStatus = defineStore("toast", {
  state: () => {
    return {
      statuses: [
        // { timestamp: 0, type: 1, message: "success sample message" },
        // { timestamp: 12, type: 2, message: "danger sample message" },
        // { timestamp: 15, type: 3, message: "warning sample message" },
      ],
    };
  },
  actions: {
    addSuccessStatus(message) {
      let timestamp = Date.now();
      let status = {
        timestamp: timestamp,
        type: STATUS.success,
        message: message,
      };
      this.statuses.push(status);
      setTimeout(() => {
        this.deleteStatus(timestamp);
      }, 3000);
    },
    addErrorStatus(message) {
      let timestamp = Date.now();
      let status = {
        timestamp: timestamp,
        type: STATUS.danger,
        message: message,
      };
      this.statuses.push(status);
      setTimeout(() => {
        this.deleteStatus(timestamp);
      }, 3000);
    },
    deleteStatus(timestamp) {
      this.statuses = this.statuses.filter(
        (status) => status.timestamp !== timestamp
      );
    },
  },
});
