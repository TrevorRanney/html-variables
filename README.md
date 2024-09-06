# html-variables

Easily Render Server-Side Variables into html

Handles interpolation, loops, and sub-pages. It also supports serving static files and applying regular expression-based routes.

# Development
`pnpm i`  
`pnpm test`

## Features
- **Variable Interpolation**: Replace placeholders in HTML with provided variables.
- **Loops**: Iterate over arrays and generate dynamic HTML content.
- **Sub-pages**: Include additional pages within a main HTML file.
- **Regex Routing**: Support for routing based on regular expressions.
- **Static File Serving**: Uses the serve-handle package by vercel to accomplish this

## Examples

```javascript
const Router = require('html-variables')
const router = Router()


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

        //output = `<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>`


const getItems = (request, response) => {
    const login = router.fileRouter('/items.html', {items});
    login(request, response);
}
router.addRoute('/getItems', '/items.html', {items})
router.addRoute('/getItems2', getItems)

```
