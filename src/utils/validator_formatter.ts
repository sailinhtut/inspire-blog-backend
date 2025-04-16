export function formatValidationErrors(errorArray) {
	const formatted = {};

	errorArray.forEach((err) => {
		if (!formatted[err.path]) {
			formatted[err.path] = [];
		}
		formatted[err.path].push(err.msg);
	});

	Object.keys(formatted).forEach((key) => {
		formatted[key] = formatted[key].join('. ');
	});

	return formatted;
}
