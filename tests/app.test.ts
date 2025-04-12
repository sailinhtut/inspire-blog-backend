import axios from 'axios';

const baseURL = 'http://localhost:8000';
const host = (uri) => `${baseURL}${uri}`;

describe('Testing Post Repository', () => {
	it('Get Paginated Posts', async () => {
		const response = await axios.get(host('/api/posts'));
		expect(response.status).toBe(200);
		expect(response.data.data).toBeInstanceOf(Array);
	});
});
