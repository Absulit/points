import { RenderPass } from "points";
import compute from "./compute.js";

const lbp_renderpass = new RenderPass(null, null, compute, 800, 800, 1);
export default lbp_renderpass;