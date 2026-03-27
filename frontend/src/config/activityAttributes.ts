export interface ActivityCategory {
    id: string;
    name: string;
    icon: string;
    attributes: string[];
}

export const ACTIVITY_CATEGORIES: ActivityCategory[] = [
    {
        id: 'sport',
        name: 'Sport i Fitness',
        icon: '🏃',
        attributes: [
            'Bieganie',
            'Jazda na rowerze',
            'Trening siłowy',
            'Joga',
            'Pływanie',
            'Tenis',
            'Piłka nożna',
            'Koszykówka',
            'Siatkówka',
            'Badminton',
            'Spacery nordic walking',
            'Rolki/Wrotki',
            'Fitness grupowy',
            'Sztuki walki',
            'Wspinaczka',
        ],
    },
    {
        id: 'pets',
        name: 'Zwierzęta',
        icon: '🐕',
        attributes: [
            'Wychodzę z psem',
            'Opieka nad kotem',
            'Spacery z psami',
            'Szukam opiekuna dla zwierzęcia',
            'Obserwacja ptaków',
            'Akwaria/Rybki',
            'Zwierzęta egzotyczne',
            'Hodowla chomików/świnek morskich',
        ],
    },
    {
        id: 'family',
        name: 'Rodzina i Dzieci',
        icon: '👨‍👩‍👧‍👦',
        attributes: [
            'Zabawy na placu zabaw',
            'Wspólne spacery z dziećmi',
            'Pomoc z odbiorem dzieci ze szkoły',
            'Wymiana zabawek/ubrań dziecięcych',
            'Organizacja urodzin',
            'Korepetycje/Pomoc w nauce',
            'Warsztaty kreatywne dla dzieci',
            'Opieka nad dziećmi',
        ],
    },
    {
        id: 'hobbies',
        name: 'Hobby i Zainteresowania',
        icon: '🎨',
        attributes: [
            'Gotowanie/Pieczenie',
            'Ogrodnictwo',
            'Gry planszowe',
            'Gry video',
            'Czytanie/Klub książki',
            'Fotografia',
            'Muzyka',
            'Rękodzieło/DIY',
            'Modelarstwo',
            'Kolekcjonerstwo',
            'Programowanie',
            'Rysunek/Malarstwo',
            'Szydełkowanie/Dzierganie',
        ],
    },
    {
        id: 'help',
        name: 'Pomoc Sąsiedzka',
        icon: '🤝',
        attributes: [
            'Wspólne zakupy',
            'Pomoc w drobnych naprawach',
            'Podlewanie roślin podczas nieobecności',
            'Odbieranie paczek',
            'Wspólny transport/Carpool',
            'Nauka języków',
            'Pomoc z technologią',
            'Pomoc seniorom',
            'Wymiana narzędzi',
            'Pomoc w przeprowadzce',
        ],
    },
    {
        id: 'social',
        name: 'Odpoczynek i Spotkania',
        icon: '☕',
        attributes: [
            'Kawa/Herbata u sąsiada',
            'Wspólne grillowanie',
            'Wieczory filmowe',
            'Wymiana książek',
            'Spacery po okolicy',
            'Wspólne wyjścia do kina/teatru',
            'Imprezy sąsiedzkie',
            'Pikniki',
            'Wieczory gier',
        ],
    },
];

export const ALL_PREDEFINED_ATTRIBUTES: string[] = ACTIVITY_CATEGORIES.flatMap(
    (category) => category.attributes
);

export const MAX_ATTRIBUTES = 15;
export const MAX_ATTRIBUTE_LENGTH = 50;
