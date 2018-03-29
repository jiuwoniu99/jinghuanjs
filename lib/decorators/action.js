module.exports = function(actionName) {
    return function(target, name, descriptor) {
        console.log(target, name, descriptor);
        Object.defineProperty(target, `${actionName || name}Action`, {
            get() {
                return descriptor.value;
            }
        });
    };
};
