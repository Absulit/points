import { RenderPass } from "points";
import compute from "./compute.js";

const reset_histogram_renderpass = new RenderPass(null, null, compute, 800, 800, 1);
export default reset_histogram_renderpass;