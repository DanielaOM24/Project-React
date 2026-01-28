import { Recipe } from "@/types/recipes";

export const RECIPES_MOCK: Recipe[] = [
    {
        id: "65fd1a8c9b1e",
        name: "Ensalada de quinoa",
        typeFood: "LUNCH",
        time: 15,
        description: "Alta en proteína vegetal y fácil de digerir",
        portion: 1,
        calories: 420,
        image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141",
        ingredients: [
            { name: "Quinoa", quantity: "1 taza" },
            { name: "Pepino", quantity: "1/2 unidad" },
            { name: "Tomate cherry", quantity: "1/2 taza" },
            { name: "Aceite de oliva", quantity: "1 cucharada" }
        ],
        steps: [
            "Cocer la quinoa en agua durante 12 minutos",
            "Picar los vegetales",
            "Mezclar todo y agregar aceite de oliva"
        ]
    },

    {
        id: "65fd1a8c9b1f",
        name: "Avena con frutas",
        typeFood: "BREAKFAST",
        time: 10,
        description: "Ideal para comenzar el día con energía",
        portion: 1,
        calories: 350,
        image: "https://images.unsplash.com/photo-1517673400267-0251440c45dc",
        ingredients: [
            { name: "Avena", quantity: "1/2 taza" },
            { name: "Banano", quantity: "1 unidad" },
            { name: "Fresas", quantity: "1/2 taza" }
        ],
        steps: [
            "Cocinar la avena en agua o leche",
            "Agregar las frutas picadas",
            "Servir caliente"
        ]
    },

    {
        id: "65fd1a8c9b20",
        name: "Pollo a la plancha con arroz integral",
        typeFood: "LUNCH",
        time: 25,
        description: "Balance perfecto entre proteína y carbohidratos",
        portion: 1,
        calories: 520,
        image: "https://images.unsplash.com/photo-1604908177522-402f3c4e4e0a",
        ingredients: [
            { name: "Pechuga de pollo", quantity: "150 g" },
            { name: "Arroz integral", quantity: "1 taza" }
        ],
        steps: [
            "Cocinar el arroz integral",
            "Asar el pollo a la plancha",
            "Servir juntos"
        ]
    },

    {
        id: "65fd1a8c9b21",
        name: "Yogur griego con nueces",
        typeFood: "SNACK",
        time: 5,
        description: "Snack rápido y alto en proteína",
        portion: 1,
        calories: 220,
        image: "https://images.unsplash.com/photo-1505253716362-afaea1f6a8a9",
        ingredients: [
            { name: "Yogur griego natural", quantity: "1 taza" },
            { name: "Nueces", quantity: "30 g" }
        ],
        steps: [
            "Servir el yogur",
            "Agregar nueces por encima"
        ]
    },

    {
        id: "65fd1a8c9b22",
        name: "Omelette de espinaca",
        typeFood: "BREAKFAST",
        time: 12,
        description: "Desayuno bajo en carbohidratos",
        portion: 1,
        calories: 280,
        image: "https://images.unsplash.com/photo-1553163147-622ab57be1c7",
        ingredients: [
            { name: "Huevos", quantity: "2 unidades" },
            { name: "Espinaca", quantity: "1 taza" }
        ],
        steps: [
            "Batir los huevos",
            "Agregar espinaca",
            "Cocinar en sartén"
        ]
    },

    {
        id: "65fd1a8c9b23",
        name: "Salmón al horno",
        typeFood: "DINNER",
        time: 30,
        description: "Rico en omega 3",
        portion: 1,
        calories: 480,
        image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db",
        ingredients: [
            { name: "Salmón", quantity: "180 g" },
            { name: "Limón", quantity: "1 unidad" }
        ],
        steps: [
            "Precalentar el horno",
            "Sazonar el salmón",
            "Hornear durante 20 minutos"
        ]
    },

    {
        id: "65fd1a8c9b24",
        name: "Wrap de vegetales",
        typeFood: "DINNER",
        time: 15,
        description: "Ligero y nutritivo",
        portion: 1,
        calories: 390,
        image: "https://images.unsplash.com/photo-1525351484163-7529414344d8",
        ingredients: [
            { name: "Tortilla integral", quantity: "1 unidad" },
            { name: "Vegetales mixtos", quantity: "1 taza" }
        ],
        steps: [
            "Saltear los vegetales",
            "Rellenar la tortilla",
            "Enrollar y servir"
        ]
    },

    {
        id: "65fd1a8c9b25",
        name: "Batido verde",
        typeFood: "SNACK",
        time: 5,
        description: "Refrescante y depurativo",
        portion: 1,
        calories: 180,
        image: "https://images.unsplash.com/photo-1542444459-db63c4c16c93",
        ingredients: [
            { name: "Espinaca", quantity: "1 taza" },
            { name: "Manzana", quantity: "1 unidad" },
            { name: "Agua", quantity: "1 vaso" }
        ],
        steps: [
            "Agregar todos los ingredientes a la licuadora",
            "Licuar hasta obtener mezcla homogénea"
        ]
    }
];
