// example option
const options = [
    {
        id: 1,
        optionName: "color",
    },

    {
        id: 2,
        optionName: "size",
    }
];

//example optionValue
const optionValues = [
    {
        id: 1,
        value: "red",
        optionId: 1
    },
    {
        id: 2,
        value: "green",
        optionId: 1
    },
    {
        id: 3,
        value: "S",
        optionId: 2
    },
    {
        id: 4,
        value: "M",
        optionId: 2
    }
]


const optionIds = [1,2];

const variantCombinationDetails = [
    {
        combinationName: 'red,S',
        optionIds: [1, 2],
        optionValueIds: [1, 3],
        mrpPrice: 130.00,
        salesPrice: 125.00,
        actualPrice: 100.00,
        stock: 10,
        imgurl : "http://aws/lootify/image-1"
    },
    {
        combinationName: 'red,M',
        optionIds: [1, 2],
        optionValueIds: [1, 4],
        mrpPrice: 140.00,
        salesPrice: 135.00,
        actualPrice: 110.00,
        stock: 11,
        imgurl : "http://aws/lootify/image-1"
    },
    {
        combinationName: 'yellow,S',
        optionIds: [1, 2],
        optionValueIds: [2, 3],
        mrpPrice: 150.00,
        salesPrice: 145.00,
        actualPrice: 120.00,
        stock: 12,
        imgurl : "http://aws/lootify/image-1"
    },
    {
        combinationName: 'yellow,M',
        optionIds: [1, 2],
        optionValueIds: [2, 3],
        mrpPrice: 160.00,
        salesPrice: 155.00,
        actualPrice: 130.00,
        stock: 13,
        imgurl : "http://aws/lootify/image-1"
    },
]