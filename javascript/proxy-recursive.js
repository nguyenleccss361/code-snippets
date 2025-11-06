function logPropertyUpdates(target) {
	if (typeof target === "object" && target !== null) {
		return new Proxy(target, {
			get(target, property, receiver) {
				const value = Reflect.get(target, property, receiver);
				return logPropertyUpdates(value);
			},
			set(target, property, value, receiver) {
				console.log(`Property "${property}" changed to "${value}"`);
				return Reflect.set(target, property, value, receiver);
			},
		});
	}
	return target;
}
const user = logPropertyUpdates({
	name: "Lew",
	details: {
		age: 24,
		country: "USA",
	},
});
user.name = "Kareem";
user.details.age = 25;
