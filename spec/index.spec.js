const fs = require('fs');
const Router = require('../index')
const handler = require('serve-handler');


const normalizeWhitespace = (str) => {
    return str
        .replace(/>\s+</g, '><')  // Remove whitespace between tags
        .replace(/\s+/g, ' ')      // Collapse multiple spaces into one
        .trim();                   // Trim leading and trailing whitespace
}


describe('frameWork', () => {
    let request;
    let response;
    let router;

    beforeEach(() => {
        router = Router()
        request = { url: '' };
        response = {
            writeHead: jasmine.createSpy('writeHead'),
            end: jasmine.createSpy('end'),
        };
    });

    it('forloop', async () => {

        const items = [
            { name: 'Item 1' },
            { name: 'Item 2' },
            { name: 'Item 3' }
        ];

        const mockHtmlContent = `
            <ul>
                $for(item : items) {
                    <li>{{ item.name }}</li>
                }
            </ul>
            `;

        spyOn(fs, 'readFileSync').and.returnValue(mockHtmlContent);

        // const fileRouter = router.fileRouter('./html/for.html', { items });
        // fileRouter(request, response);

        router.addRoute('/test', 'test.html', {items})

        const request = { url: '/test' };
        const response = {
            writeHead: jasmine.createSpy('writeHead'),
            end: jasmine.createSpy('end'),
        };
        await router.router(request, response);

        const expectedOutput = '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>';
        expect(response.writeHead).toHaveBeenCalledWith(200, { 'Content-Type': 'text/html' });
        expect(normalizeWhitespace(response.end.calls.mostRecent().args[0])).toBe(normalizeWhitespace(expectedOutput));
    });


    it('should add a route with fileRouter (html file)', () => {
        router.addRoute('/test', 'test.html');
        request.url = '/test';

        spyOn(fs, 'readFileSync').and.returnValue('<html><body></body></html>');
        router.router(request, response);

        expect(response.writeHead).toHaveBeenCalledWith(200, { 'Content-Type': 'text/html' });
        expect(response.end).toHaveBeenCalled();
    });

    it('should add a regex route and match correctly', () => {
        router.addRoute(/\/test\/\d+/, (req, res) => {
            res.end('regex matched');
        });
        request.url = '/test/123';

        router.router(request, response);

        expect(response.end).toHaveBeenCalledWith('regex matched');
    });


    it('should allow setting a body URL', async () => {
        const mockHtmlContent = `THIS IS THE BODY`;
        const mockBodyContent = '<html>{{body}}</html>';

        // Mock fs.readFileSync to return different content based on the file path
        spyOn(fs, 'readFileSync').and.callFake((filePath) => {
            if (filePath.includes('body.html')) {
                return mockBodyContent;
            } else {
                return mockHtmlContent;
            }
        });


        router.setBody('body.html');
        router.addRoute('/test', 'test.html', {})

        const request = { url: '/test' };
        const response = {
            writeHead: jasmine.createSpy('writeHead'),
            end: jasmine.createSpy('end'),
        };
        await router.router(request, response);
        expect(response.end.calls.mostRecent().args[0]).toEqual('<html>THIS IS THE BODY</html>')
    });

    it('should resovle a funciton', async () => {
        var hit = false;
        const testfunc = () => {
            hit = true;
        }
        router.addRoute('/func', testfunc)
        const request = { url: '/func' };
        const response = {
            writeHead: jasmine.createSpy('writeHead'),
            end: jasmine.createSpy('end'),
        };
        await router.router(request, response)
        expect(hit).toEqual(true)
    });

    it('should pass the test when handler is called', async () => {
        spyOn(handler, 'call').and.returnValue('200') // Spy on the handler

        request = {
            url: '/non-existing-route',
            headers: {
                accept: 'text/html' // or 'application/json' if needed
            }
        };

        // Mock the response object
        response = {
            end: jasmine.createSpy('end'),
            writeHead: jasmine.createSpy('writeHead')
        };
        await router.router(request, response);
        expect(response.statusCode).toEqual(404)
    });
    

    it('forloop', async () => {

        const items = [
            { name: 'Item 1' },
            { name: 'Item 2' },
            { name: 'Item 3' }
        ];

        const htmlContent = `
            <ul>
                $for(item : items) {
                    <li>{{ item.name }}</li>
                }
            </ul>
            `;

        const output = router.evaluate(htmlContent, {items})

        const expectedOutput = '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>';
        expect(normalizeWhitespace(output)).toBe(normalizeWhitespace(expectedOutput));
    });


});



