export const WHO_SAID_IT = [
    {
        id: '1',
        quote: "Let my people go, that they may serve me.",
        options: ['Moses', 'Aaron', 'Joshua', 'David'],
        correct: 0,
        reference: 'Exodus 8:1'
    },
    {
        id: '2',
        quote: "But as for me and my house, we will serve the Lord.",
        options: ['Moses', 'Joshua', 'Caleb', 'Gideon'],
        correct: 1,
        reference: 'Joshua 24:15'
    },
    {
        id: '3',
        quote: "The Lord is my shepherd; I shall not want.",
        options: ['Solomon', 'Samuel', 'David', 'Asaph'],
        correct: 2,
        reference: 'Psalm 23:1'
    },
    {
        id: '4',
        quote: "I am the way, the truth, and the life.",
        options: ['Paul', 'John the Baptist', 'Peter', 'Jesus'],
        correct: 3,
        reference: 'John 14:6'
    }
];

export const BIBLE_CHARADES = [
    { title: 'Noah Ark', category: 'Story' },
    { title: 'David vs Goliath', category: 'Miracle/Battle' },
    { title: 'Parting of the Red Sea', category: 'Miracle' },
    { title: 'The Last Supper', category: 'Event' },
    { title: 'Feeding the 5000', category: 'Miracle' },
    { title: 'Jonah and the Whale', category: 'Story' },
    { title: 'The Good Samaritan', category: 'Parable' }
];

export const SCRIPTURE_SCRAMBLE = [
    { word: 'GENESIS', hint: 'The first book of the Bible.' },
    { word: 'PARABLE', hint: 'A simple story used to illustrate a moral or spiritual lesson.' },
    { word: 'HALLELUJAH', hint: 'An expression of worship or rejoicing.' },
    { word: 'BETHLEHEM', hint: 'The birthplace of Jesus.' },
    { word: 'DISCIPLE', hint: 'A follower or student of a teacher, leader, or philosopher.' }
];

export const NAME_THAT_PARABLE = [
    {
        id: '1',
        clues: [
            'A son leaves his father with his inheritance.',
            'He wastes all his money on riotous living.',
            'He returns home and his father welcomes him with a feast.'
        ],
        answer: 'The Prodigal Son'
    },
    {
        id: '2',
        clues: [
            'A man is beaten and left for dead on the road.',
            'A priest and a Levite pass him by.',
            'A man from a despised group stops to help him.'
        ],
        answer: 'The Good Samaritan'
    }
];

export const FAITH_BINGO_TILES = [
    'Cross', 'Bible', 'Dove', 'Jesus', 'Mary', 'Moses', 'David', 'Noah',
    'Faith', 'Hope', 'Love', 'Prayer', 'Church', 'Saint', 'Angel', 'Miracle',
    'Gospel', 'Psalm', 'Eden', 'Sinai', 'Jordan', 'Calvary', 'Amen', 'Grace'
];

export const JOURNEY_THROUGH_BIBLE = [
    { id: 'creation', title: 'Creation', description: 'In the beginning...' },
    { id: 'flood', title: 'The Great Flood', description: 'Noah builds an ark.' },
    { id: 'exodus', title: 'The Exodus', description: 'Leaving Egypt behind.' },
    { id: 'sinai', title: 'Commandments', description: 'Law given at Sinai.' },
    { id: 'promised_land', title: 'Promised Land', description: 'Entering Canaan.' },
    { id: 'kingdom', title: 'The Kingdom', description: 'Era of Kings and Prophets.' },
    { id: 'nativity', title: 'The Nativity', description: 'The Savior is born.' },
    { id: 'resurrection', title: 'Resurrection', description: 'He is risen!' }
];

export const VIRTUE_QUEST = [
    {
        virtue: 'Patience',
        challenge: 'Count to 10 slowly before answering the next question.',
        question: 'Who is the biblical figure known for great patience during suffering?',
        answer: 'Job'
    },
    {
        virtue: 'Kindness',
        challenge: 'Say something kind about the person next to you (or a friend).',
        question: 'What virtue is listed first in 1 Corinthians 13:4?',
        answer: 'Patience (Love is patient, love is kind...)'
    }
];

export const CHURCH_HISTORY = [
    {
        id: '1',
        question: 'Which council in 325 AD formulated the Nicene Creed?',
        options: ['Constantinople', 'Nicaea', 'Ephesus', 'Chalcedon'],
        correct: 1
    },
    {
        id: '2',
        question: 'Who is the famous Ethiopian saint who stood on one leg for seven years in prayer?',
        options: ['Saint Tekle Haymanot', 'Saint Gebre Menfes Kidus', 'Saint Yared', 'Saint Samuel'],
        correct: 0
    }
];

export const PRAYER_MATCHUP = [
    { prayer: 'Lord have mercy', purpose: 'Forgiveness/Kyrie' },
    { prayer: 'Give us this day our daily bread', purpose: 'Petition/Provision' },
    { prayer: 'Glory be to the Father', purpose: 'Praise/Doxology' },
    { prayer: 'Holy, Holy, Holy', purpose: 'Adoration/Sanctus' }
];

export const SAINT_QUESTIONS = [
    {
        id: '1',
        name: 'Saint Peter',
        clues: [
            'One of the twelve apostles',
            'Known as the "Rock"',
            'Denied Jesus three times but was restored',
            'Preached at Pentecost and was the first to baptize a Gentile'
        ],
        image: 'https://i.pinimg.com/736x/67/28/35/6728350800a3f6a4d040d34eb27850ae.jpg'
    },
    {
        id: '2',
        name: 'Saint Paul',
        clues: [
            'Formerly known as Saul of Tarsus',
            'Wrote 14 epistles in the New Testament',
            'Apostle to the Gentiles',
            'Converted on the road to Damascus by a vision of Christ'
        ],
        image: 'https://i.pinimg.com/736x/21/78/6f/21786f5619a652628373831a6a131a50.jpg'
    },
    {
        id: '3',
        name: 'Saint Mary (Theotokos)',
        clues: [
            'Mother of our Lord Jesus Christ',
            'Venerated as "More honorable than the Cherubim"',
            'Gave her free consent to the Archangel Gabriel',
            'Present at the Foot of the Cross'
        ],
        image: 'https://i.pinimg.com/736x/35/d4/8b/35d48b37a8249216eaa5f5fc4ad4cf1a.jpg'
    },
    {
        id: '4',
        name: 'Saint George',
        clues: [
            'The Great Martyr and Trophy-bearer',
            'Roman soldier who refused to sacrifice to idols',
            'Famous for the miracle of the dragon',
            'Patron saint of many nations and highly venerated in Ethiopia'
        ],
        image: 'https://i.pinimg.com/736x/d7/a2/04/d7a2049775051042dbaa040120af2b43.jpg'
    },
    {
        id: '5',
        name: 'Saint Mark',
        clues: [
            'Author of the second Gospel',
            'Founded the Church of Alexandria',
            'Associated with the symbol of the Lion',
            'Spiritual son of Saint Peter'
        ],
        image: 'https://i.pinimg.com/736x/f9/b9/43/f9b943741c9ee3d252be50a34b760815.jpg'
    },
    {
        id: '6',
        name: 'Saint Anthony the Great',
        clues: [
            'Father of All Monks',
            'Sold everything and went into the Egyptian desert',
            'Faced many spiritual battles and temptations',
            'Lived to be 105 years old'
        ],
        image: 'https://i.pinimg.com/736x/0e/8c/7b/0e8c7b560dc14591493fcc0efba99e89.jpg'
    },
    {
        id: '7',
        name: 'Saint Athanasius',
        clues: [
            'Defender of Orthodoxy against Arianism',
            'Bishop of Alexandria',
            'Wrote "On the Incarnation"',
            'Known as "Athanasius contra mundum"'
        ],
        image: 'https://i.pinimg.com/736x/8c/ef/2c/8cef2cb3560f8facaa085d29b967e796.jpg'
    },
    {
        id: '8',
        name: 'Saint Cyril of Alexandria',
        clues: [
            'Defender of the "Theotokos" title for Mary',
            'Presided over the Third Ecumenical Council in Ephesus',
            'Known as the "Seal of the Fathers"',
            'Greatly emphasized the unity of Christ'
        ],
        image: 'https://i.pinimg.com/736x/3f/7c/51/3f7c5169443d3c1edb13e3cf68ec8b91.jpg'
    }
];

export const SAINT_OPTIONS = [
    'Saint Peter',
    'Saint Paul',
    'Saint Mary (Theotokos)',
    'Saint George',
    'Saint Mark',
    'Saint Anthony the Great',
    'Saint Athanasius',
    'Saint Cyril of Alexandria',
    'Saint John Chrysostom',
    'Saint Basil the Great',
    'Saint Gregory the Theologian',
    'Saint Nicholas'
];
