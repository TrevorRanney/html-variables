const interpolate = require('../interpolater');
const { loop } = require('../forlooper')

describe('interpolate function', function () {

    it('should replace placeholder with the expected HTML anchor tag', function () {
        const inputString = '{{ user.store?.name ? `<a href="/view-store">View your Store</a>` : "" }}';
        const data = {
            user: {
                store: {
                    name: 'My Store'
                }
            }
        };
        const expectedOutput = '<a href="/view-store">View your Store</a>';
        const result = interpolate(inputString, data);
        expect(result).toBe(expectedOutput);
    });

    it('should return an empty string when the store name is undefined', function () {
        const inputString = '{{ user.store?.name ? `<a href="/view-store">View your Store</a>` : "" }}';
        const data = {
            user: {
                store: {}
            }
        };
        const expectedOutput = '';
        const result = interpolate(inputString, data);
        expect(result).toBe(expectedOutput);
    });

    it('should handle multiple placeholders', function () {
        const inputString = 'Hello, {{ user.name }}! Your store is {{ user.store?.name || "unavailable" }}.';
        const data = {
            user: {
                name: 'Trevor',
                store: {
                    name: 'My Store'
                }
            }
        };
        const expectedOutput = 'Hello, Trevor! Your store is My Store.';
        const result = interpolate(inputString, data);
        expect(result).toBe(expectedOutput);
    });

    it('should handle placeholders with non-string data types', function () {
        const inputString = 'You have {{ user.notifications }} new notifications.';
        const data = {
            user: {
                notifications: 3
            }
        };
        const expectedOutput = 'You have 3 new notifications.';
        const result = interpolate(inputString, data);
        expect(result).toBe(expectedOutput);
    });

    it('should handle undefined variables gracefully', function () {
        const inputString = 'Hello, {{ user.name }}!';
        const data = {};
        const expectedOutput = 'Hello, !';
        const result = interpolate(inputString, data);
        expect(result).toBe(expectedOutput);
    });

    it('should replace placeholder with the expected HTML anchor tag', function () {
        const inputString = '{{ user.store?.name ? `<a href="/view-store?=${user.store.name}">View your Store</a>` : "" }}';
        const data = {
            user: {
                store: {
                    name: 'MyStore'
                }
            }
        };
        const expectedOutput = '<a href="/view-store?=MyStore">View your Store</a>';
        const result = interpolate(inputString, data);
        expect(result).toBe(expectedOutput);
    });

    it('should return a JSON string when the placeholder evaluates to an object', function () {
        const inputString = 'User store details: {{ user.store }}';
        const data = {
            user: {
                store: {
                    name: 'My Store',
                    description: 'A nice store'
                }
            }
        };
        const expectedOutput = 'User store details: {"name":"My Store","description":"A nice store"}';
        const result = interpolate(inputString, data);
        expect(result).toBe(expectedOutput);
    });

    it('should return an empty string when the placeholder evaluates to undefined', function () {
        const inputString = 'Hello, {{ user.undefinedProperty }}!';
        const data = {
            user: {
                name: 'Trevor'
            }
        };
        const expectedOutput = 'Hello, !';
        const result = interpolate(inputString, data);
        expect(result).toBe(expectedOutput);
    });

    it('should correctly stringify variables, even when some are undefined', () => {
        const inputString = 'Store name: {{ store.name }}, Store location: {{ store.location }}';
        const data = {
            store: {
                name: 'My Store',
                location: undefined // Explicitly undefined
            }
        };
        const expectedOutput = 'Store name: My Store, Store location: ';
        const result = interpolate(inputString, data);
        expect(result).toBe(expectedOutput);
    });

    it('should interpolate a link', () => {

        const inputString = `<img class="food-image" src="user-pictures/{{user._id}}/{{user.store.items[0].name}}.webp" />`;
        const user = {
            _id: 'USER ID',
            store: {
                items: [
                    { name: 'foood' }
                ]
            }
        }

        const expectedOutput = '<img class="food-image" src="user-pictures/USER ID/foood.webp" />'
        var output = interpolate(inputString, { user })
        expect(output).toBe(expectedOutput)
    })

    it('should interpolate multiple vars', () => {

        const inputString = `<img class="food-image" src="user-pictures/{{user._id}}/{{food.name}}.webp" />`;
        const user = {  _id: 'USER ID' }
        const food = {  name: 'foood' }

        const expectedOutput = '<img class="food-image" src="user-pictures/USER ID/foood.webp" />'
        var output = interpolate(inputString, { user, food })
        expect(output).toBe(expectedOutput)
    })

    it('should loop the interpolating', () => {

        const inputString = `$for(food : user.store.items)
            {
                <img class="food-image"	src="user-pictures/{{user._id}}/{{food.name}}.webp" />
            }`;
        const user = {
            _id: 'USER ID',
            store: {
                items: [
                    { name: 'foood' }
                ]
            }
        }

        const expectedOutput = '<img class="food-image"	src="user-pictures/USER ID/foood.webp" />'
        var htmlWithSubPagesAndLoops = loop(inputString, { user })
        expect(htmlWithSubPagesAndLoops).toBe(expectedOutput)
    })

});
