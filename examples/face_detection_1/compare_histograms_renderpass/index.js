import { RenderPass } from "points";
import compute from "./compute.js";

const compare_histogram_renderpass = new RenderPass(null, null, compute, 800, 800, 1);
export default compare_histogram_renderpass;