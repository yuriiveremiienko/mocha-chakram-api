const chakram = require('chakram');
const expect = chakram.expect;

const url = 'https://api.trello.com/';
const apiKey = '710c5185e71619f336f4b625ce9f46f4';
const apiToken = '944941047fa41f7548ed387ee95e723bb6a63d51cc4d0b3849a989908aa9e2b1';
const authString = `key=${apiKey}&token=${apiToken}`;

describe(`Get endpoint ${url} should return`, function () {
	const newBoardParams = {
		name: 'board for api test',
		prefs_background: 'red'
	};
	let newBoardId;
	let newBoardTag;
	let newBoardShortUrl;
	let newBoardUrl;
	let boardGetResponse;

	before(async () => {
		const newBoard  = await chakram.post(`${url}1/boards?${authString}`, newBoardParams);

		newBoardTag = newBoard.body.shortUrl.split('/').pop();
		newBoardId = newBoard.body.id;
		newBoardShortUrl = newBoard.body.shortUrl;
		newBoardUrl = newBoard.body.url;

		boardGetResponse = await chakram.get(`${url}1/boards/${newBoardTag}?${authString}`);
	});

	after(async () => {
		await chakram.delete(`${url}1/boards/${newBoardTag}?${authString}`);
	});
	
	it('error 401 for unauthorised user', async () => {
		const res = await chakram.get(`${url}1/boards/${newBoardTag}`);

		expect(res).to.have.status(401);
	});
	it('correct status code', async () => {
		expect(boardGetResponse).to.have.status(200);
	});
	it('correct headers', async () => {
		expect(boardGetResponse).to.have.header('access-control-allow-headers', 'Authorization, Accept, Content-Type');
		expect(boardGetResponse).to.have.header('access-control-allow-methods', 'GET, PUT, POST, DELETE');
		expect(boardGetResponse).to.have.header('access-control-allow-origin', '*');
		expect(boardGetResponse).to.have.header('cache-control', 'max-age=0, must-revalidate, no-cache, no-store');
		expect(boardGetResponse).to.have.header('content-type', 'application/json; charset=utf-8');
		expect(boardGetResponse).to.have.header('referrer-policy', 'strict-origin-when-cross-origin');
		// ...and so on
	});
	it('correct item (body)', async () => {
		expect(boardGetResponse).to.have.json('name', newBoardParams.name);
		expect(boardGetResponse).to.have.json('closed', false);
		expect(boardGetResponse).to.have.json('pinned', false);
		expect(boardGetResponse).to.have.json('id', newBoardId);
		expect(boardGetResponse).to.have.json('descData', null);
		expect(boardGetResponse).to.have.json('idOrganization', null);
		expect(boardGetResponse).to.have.json('shortUrl', newBoardShortUrl);
		expect(boardGetResponse).to.have.json('url', newBoardUrl);
		expect(boardGetResponse).to.have.json('labelNames',
			{
				green: '',
				yellow: '',
				orange: '',
				red: '',
				purple: '',
				blue: '',
				sky: '',
				lime: '',
				pink: '',
				black: ''
			});
		// ...and so on
	});
	it('error 404 for non-existing item', async () => {
		const res = await chakram.get(`${url}1/boards/11111111?${authString}`);

		expect(res).to.have.status(404);
	});
	it('error 404 (301?) for deleted item', async () => {
		const board  = await chakram.post(`${url}1/boards?${authString}`, newBoardParams);
		const boardTag = board.body.shortUrl.split('/').pop();

		await chakram.delete(`${url}1/boards/${boardTag}?${authString}`);

		const res = await chakram.get(`${url}1/boards/${boardTag}?${authString}`);

		expect(res).to.have.status(404);
	});
	it('error 400 for wrong params ?badparam=true', async () => {
		const res = await chakram.get(`${url}1/boards/${newBoardTag}?badparam=true,false&${authString}`);

		expect(res).to.have.status(200);
	});
	it('error 404 for non-existing item collection', async () => {
		const res = await chakram.get(`${url}1/somecollection?${authString}`);

		expect(res).to.have.status(404);
		expect(res.body).to.include('Cannot GET');
	});
	it('correct ids for linked items', async () => {
		const newList= await chakram.post(`${url}1/boards/${newBoardTag}/lists?${authString}`,
				{
					id: "560bf446f17023a3710658fb",
					name: "Alaska",
					closed: false,
					pos: 65535
				}
		);
		const list = await chakram.get(`${url}1/lists/${newList.body.id}?${authString}`);

		expect(list.body.idBoard).to.equal(newBoardId);
	});
	it('correct items collection', async () => {
		const lists = await chakram.get(`${url}1/boards/${newBoardTag}/lists?${authString}`);

		lists.body.forEach((list) => {
			expect(list).to.have.property('id');
			expect(list).to.have.property('name');
			expect(list).to.have.property('idBoard');
			expect(list).to.have.property('pos');
			expect(list).to.have.property('closed', false);
			expect(list).to.have.property('subscribed', false);
		});
	});


	it('correct item when part of props is restricted');
	it('correct items collection when part of props is restricted');
	it('correct items collection with ?param=true');
	it('correct items collection with multiple ?param=true,lol,etc');
	it('correct items collection with combination ?param=true,lol,etc&year=2018');
	it('error 403 for restricted item');
	it('error 403 for restricted items collection');

	//pagination
	it('correct number of items on page');
	it('correct link for next page');
	it('correct link for previous page');
	it('correct links for next/previous pages when on first/last page');
});