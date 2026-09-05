import { createFinding } from "../../normalize/finding.js";
import { deviceMotion } from "../../messages.js";
import type { Finding } from "../../report/types.js";
import type { StaticContext, StaticRule } from "../types.js";

const MOTION = /devicemotion|deviceorientation|DeviceMotionEvent|DeviceOrientationEvent/;

export const rule: StaticRule = {
  id: "k-device-motion",
  kwcag: "6.5.4",
  wcag: ["2.5.4"],
  engine: "k",
  impact: "moderate",
  confidence: "low",
  tier: "T2",
  run(ctx: StaticContext): Finding[] {
    for (const script of Array.from(ctx.document.querySelectorAll("script"))) {
      const code = script.textContent ?? "";
      if (code && MOTION.test(code)) {
        return [createFinding(rule, script, { message: deviceMotion.message, fix: deviceMotion.fix, outcome: "incomplete" })];
      }
    }
    return [];
  },
};
