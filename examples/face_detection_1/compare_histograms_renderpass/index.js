import { RenderPass } from "points";
import compute from "./compute.js";

const compare_histograms_renderpass = new RenderPass(null, null, compute, 800, 800, 1);
export default compare_histograms_renderpass;
