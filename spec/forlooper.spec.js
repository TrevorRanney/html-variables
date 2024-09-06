const { loop } = require('../forlooper');

const normalizeWhitespace = (str) => {
    return str
        .replace(/>\s+</g, '><')  // Remove whitespace between tags
        .replace(/\s+/g, ' ')      // Collapse multiple spaces into one
        .trim();                   // Trim leading and trailing whitespace
}


describe('loop function', () => {

    it('should correctly interpolate HTML with order data', () => {
        const inputString = `$for(cartItem : order.cartItems)
        {
        <div class="item">
            <label>{{cartItem.name}}</label>
            <input type="number" class="quantity" id="{{cartItem.id}}" name="{{cartItem.id}}" value="{{cartItem.quantity}}"/>
            <button type="button">+</button><button type="button">-</button>
            <button type="button">Remove</button>
        </div>
        }`;

        const order = {
            _id: "66c7ddb346744910a7662617",
            cartId: 'aea376a7-b12c-4a84-a58b-12e5f4591e88',
            storeId: '6547ac2923bba4ea411a8637',
            cartItems: [
                {
                    name: 'Grilled Salmon',
                    price: '15.90',
                    quantity: 1,
                    itemTotalPrice: 15.9,
                    id: "65491332e1555ea071e3b827"
                }
            ],
            total: 15.9,
            clientSecret: 'pi_3PqllXGM1vYgVIPY1SHqGQRj_secret_gAZNj7fXIOLfByX2LeUXKfz1Y',
            createdAt: '2024-08-23T00:54:11.415Z',
            updatedAt: '2024-08-23T00:54:11.415Z',
            __v: 0
        };

        const expectedOutput = `<div class="item">
            <label>Grilled Salmon</label>
            <input type="number" class="quantity" id="65491332e1555ea071e3b827" name="65491332e1555ea071e3b827" value="1"/>
            <button type="button">+</button><button type="button">-</button>
            <button type="button">Remove</button>
        </div>`;

        const result = loop(inputString, { order });
        expect(result.trim()).toBe(expectedOutput.trim());
    });

    it('should correctly handle nested loops', function () {
        const inputString = `
        $for(food : user.store.items)
        {
            <div>{{food.name}}:</div>
            $for(item : food.ingredients)
            {
                <span>{{item.ingredient}}</span>
            }
        }`;

        const user = {
            _id: "6547ac2923bba4ea411a8637",
            email: 'email@email.com',
            store: {
                items: [
                    {
                        name: "Hot Dog",
                        price: "4.20",
                        description: "A hot dog with your choice of toppings,\r\nketchup, mustard, onions, relish, pickles, chili, cheese",
                        ingredients: [
                            { ingredient: "Meat", organic: true },
                            { ingredient: "Meat2", organic: true },
                        ],
                        _id: "654911829632cb15a01fc21d"
                    },
                    {
                        name: "Hot Dog2",
                        price: "4.20",
                        description: "A hot dog with your choice of toppings,\r\nketchup, mustard, onions, relish, pickles, chili, cheese",
                        ingredients: [
                            { ingredient: "Meat3", organic: true },
                        ],
                        _id: "654911829632cb15a01fc21d"
                    },
                ],
                description: 'I make lunch and bring it to you around lunch time',
                name: 'Lunch Lad',
                pickup: false,
                delivery: true
            },
        };

        const expectedOutput = `
        <div>Hot Dog:</div>
            <span>Meat</span><span>Meat2</span><div>Hot Dog2:</div>
            <span>Meat3</span>`;

        const result = loop(inputString, { user });
        expect(result.trim()).toBe(expectedOutput.trim());
    });


    it('should correctly interpolate HTML with mixed user and order data', () => {
        const inputString = `$for(cartItem : order.cartItems)
        {
        <div class="item">
            <label>{{cartItem.name}}</label>
            <input type="number" class="quantity" id="{{cartItem.id}}" name="{{cartItem.id}}" value="{{cartItem.quantity}}"/>
            <button type="button">+</button><button type="button">-</button>
            <button type="button">Remove</button>
        </div>
        }`;

        const user = {
            _id: "6547ac2923bba4ea411a8637",
            email: 'email@email.com',
            store: {
                items: [],
                description: 'I make lunch and bring it to you around lunch time',
                name: 'Lunch Lad',
                pickup: false,
                delivery: true
            },
        };

        const order = {
            _id: "66c7ddb346744910a7662617",
            cartId: 'aea376a7-b12c-4a84-a58b-12e5f4591e88',
            storeId: '6547ac2923bba4ea411a8637',
            cartItems: [
                {
                    name: 'Grilled Salmon',
                    price: '15.90',
                    quantity: 1,
                    itemTotalPrice: 15.9,
                    id: "65491332e1555ea071e3b827"
                }
            ],
            total: 15.9,
            clientSecret: 'pi_3PqllXGM1vYgVIPY1SHqGQRj_secret_gAZNj7fXIOLfByX2LeUXKfz1Y',
            createdAt: '2024-08-23T00:54:11.415Z',
            updatedAt: '2024-08-23T00:54:11.415Z',
            __v: 0
        };


        const expectedOutput = `<div class="item">
            <label>Grilled Salmon</label>
            <input type="number" class="quantity" id="65491332e1555ea071e3b827" name="65491332e1555ea071e3b827" value="1"/>
            <button type="button">+</button><button type="button">-</button>
            <button type="button">Remove</button>
        </div>`;

        const result = loop(inputString, { user, order });
        expect(result.trim()).toBe(expectedOutput.trim());
    });

    it('should correctly interpolate HTML with ingredient data', () => {
        const inputString = `
$for(food : user.store.items)
{
    [[spec/html/ingredient.html(food.ingredients)]]
}`;

        const user = {
            _id: "6547ac2923bba4ea411a8637",
            email: 'email@email.com',
            store: {
                items: [
                    {
                        name: "Hot Dog",
                        price: "4.20",
                        description: "A hot dog with your choice of toppings,\r\nketchup, mustard, onions, relish, pickles, chili, cheese",
                        ingredients: [
                            { name: "Meat", organic: true },
                            { name: "Meat2", organic: true },
                        ],
                        _id: "654911829632cb15a01fc21d"
                    },
                    {
                        name: "Hot Dog2",
                        price: "4.20",
                        description: "A hot dog with your choice of toppings,\r\nketchup, mustard, onions, relish, pickles, chili, cheese",
                        ingredients: [
                            { name: "Meat3", organic: true },
                        ],
                        _id: "654911829632cb15a01fc21d"
                    },
                ],
                description: 'I make lunch and bring it to you around lunch time',
                name: 'Lunch Lad',
                pickup: false,
                delivery: true
            },
        };

        const expectedOutput = `
            <div>
                <span>Meat</span>
                    <span>✔️</span><span>Meat2</span>
                    <span>✔️</span>
            </div>
            <div>
                <span>Meat3</span>
                    <span>✔️</span>
            </div>`;

        const result = loop(inputString, { user });
        expect(normalizeWhitespace(result)).toBe(normalizeWhitespace(expectedOutput));
    });
    

});

