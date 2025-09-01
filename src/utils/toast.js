import { toast } from "react-hot-toast";

export const notify = {
  success: (msg, opts) => toast.success(msg, opts),
  error: (msg, opts) => toast.error(msg, opts),
  info: (msg, opts) => toast(msg, opts),
  promise: (p, msgs, opts) => toast.promise(p, msgs, opts),
};