describe('Semantic Test', function () {
	it('Return Type of parseInt', function () {
		console.log(parseInt('null'));
		expect(true).toBe(true);
	});
});

describe('Semantic Test 2', function () {
	it('Return Type of null', function () {
		console.log(parseInt('null'));
		expect(true).toBe(true);
	});
});

describe('Semantic Test 3', function () {
	it('Get Values of Enum', function () {
		enum Status {
			ACTIVE = 'active',
			DISABLE = 'disable',
		}
		console.log(Object.values(Status));
		expect(true).toBe(true);
	});
});
