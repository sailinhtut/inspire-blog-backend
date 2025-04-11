import axios from 'axios';

const baseURL = 'http://localhost:8000';
const host = (uri) => `${baseURL}${uri}`;

describe('GET /ping', () => {
	it('should return pong', async () => {
		const response = await axios.get(host('/ping'));
		expect(response.status).toBe(200);
		expect(response.data).toBe('pong');
	});
});

describe('GET /sailinhtut', () => {
	it('should return pong', async () => {
		const response = await axios.get(host('/sailinhtut'));
		expect(response.status).toBe(200);
		expect(response.data).toBe('Professional Software Engineer');
	});
});
