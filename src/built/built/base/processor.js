define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.post = exports.pre = exports.addPost = exports.addPre = void 0;
    let preprocs = [];
    let postprocs = [];
    function addPre(proc) {
        preprocs.push(proc);
    }
    exports.addPre = addPre;
    function addPost(proc) {
        postprocs.push(proc);
    }
    exports.addPost = addPost;
    function run(procs) {
        for (let proc of procs) {
            proc.run();
            if (proc.isFinished()) {
                procs.splice(procs.indexOf(proc), 1);
            }
        }
    }
    function pre() {
        run(preprocs);
    }
    exports.pre = pre;
    function post() {
        run(postprocs);
    }
    exports.post = post;
});
//# sourceMappingURL=processor.js.map