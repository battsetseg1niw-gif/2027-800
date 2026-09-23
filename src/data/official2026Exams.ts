import { Exam, Question } from "../types";

// Official Reading Passages
export const PASSAGE_TWEENBOTS = `Tweenbots
Imagine the busy streets of New York City, an enormous place with millions of people. Every day, the streets are congested with people going about their daily lives. Now imagine a small robot in the middle of all of those people rolling down a busy sidewalk. Most people would not even notice the ten-inch smiling robot, called a Tweenbot, rolling along the street. This strange machine may interest some people, while others would ignore it completely. A researcher interested in studying how helpful people really are uses such robots in her experiments that take place on the streets of New York.
The Tweenbots experiment is the idea and creation of Kacie Kinzer. Kinzer’s idea was to make a robot that could navigate the city and reach its destination only if it was aided by pedestrians. Tweenbots rely on the kindness of warm-hearted strangers. Made simply of cardboard, wheels, and a device to turn the wheels, the Tweenbots face many dangers on the city streets. They could be run over by cars or smashed by careless kids. Kinzer thought her little robots might even be seen as some kind of terrorist device. The only real protection a Tweenbot has its friendly smile. In addition to that, each of Kinzer’s robots is fitted with a flag that displays instructions for the robot’s destination. The only way these robots will reach their final point is if someone lends them a hand. Tweenbots are essentially a social experiment aimed at providing people a chance to show how caring they are.
On a daily basis, people in New York City are often in a hurry to get around. However, the Tweenbots, through their inability to look after themselves, took people out of their normal routines. The people who noticed the helpless little robots were actually interested in helping the Tweenbots find their way home. Tweenbots move at a constant speed and can only go in a straight line. If one was to get stuck, or was going in the wrong direction, it would be up to strangers to free it or turn it in the right direction. Surprisingly, no Tweenbot was lost or damaged, and each one arrived at its target in good condition. In fact, most people treated the robot in a gentle manner, and some even treated it as though it were a small living being.
Even if you were in a rush to go somewhere, would you stop and help a Tweenbot successfully reach its destination?`;

export const PASSAGE_NATURALLY_BETTER_HOMES = `Naturally Better Homes
In the 1970s, many people became concerned about energy. People had to face up to the fact that they used too much energy, and energy sources were not going to last forever. One architect, Michael Reynolds, decided to do something. He set out to design homes that were cheaper to build and more energy efficient. In addition, he wanted to do something about all the garbage. Finally, he came up with the idea of “earthships.”
Although it sounds like a boat, an earthship is a house. However, unlike regular houses, earthships are constructed from garbage and are built using only ten percent of the energy needed to build a typical house. Moreover, after they are built, earthships use only ten percent of the energy required to heat, light, and cool a regular home. Although earthships sound unique, they can actually be built to look just like any other house.
One of the big benefits of earthships is that they are made from recycled materials. The main construction material of an earthship is used tires that are filled with dirt. The dirt-filled tires are then laid flat and stacked like bricks. Because the tires are round, there is lots of extra space between the columns of tires. These spaces are filled with used cardboard. The tires and cardboard form the outside walls of an earthship. The inside walls between rooms in the earthship do not need to be as strong as the outside walls; therefore, the inside walls are made with old cans, bottles, and cement that are eventually covered and painted to look just like walls in a typical home.
Another benefit of an earthship is that it saves energy and natural resources. For example, an earthship uses less water. Rain water, which is collected on the roof, is used for drinking and bathing. Furthermore, earthships need much less energy for heating and cooling because they are built into the ground, which keeps the temperature inside the house from getting too hot or too cold. In the long run, this helps earthship owners lower their utility bills. As well, one wall of an earthship usually faces south. Therefore, solar heat helps to warm the house, and solar panels built on the roof generate electricity to run appliances in the house.
All of these features make earthships very environmentally friendly. That’s one of the reasons they have become popular throughout the world. Earthships have been built in Bolivia, Australia, Mexico, Japan, Canada, England, Scotland, and all over the US. Maybe in the near future, an earthship will be landing near you!`;

// Section 2 Tasks shared templates with variant-specific answers
export function buildSection2Questions(variant: "A" | "B" | "C" | "D"): Question[] {
  // 2.1 Word Formation Cloze (6 items x 1 = 6 pts)
  const q2_1: Question = {
    id: `esh-2026-${variant.toLowerCase()}-task-2-1`,
    questionNumber: 48,
    text: `Read the paragraph and choose the correct word form that best fits in each blank.`,
    category: "Vocabulary",
    topic: "Word Formation Cloze",
    subtopic: "Noun/Verb/Adjective/Adverb Forms",
    difficulty: "Hard",
    points: 6,
    section: 2,
    taskNumber: "2.1",
    taskTitle: "Word Formation Cloze",
    taskInstruction: "Хаалтан дахь үсгүүдийн оронд тохирох үгийн бүтцийг сонгоно уу.",
    pointFormula: "/6x1=6 points/",
    readingPassage: `Qualifications prove you've (a) _________ knowledge or developed skills. For some careers like medicine and law, it's essential you have (b) _________ qualifications. For others, such as journalism, it helps to have a (c) _________ qualification. Most universities set (d) _________ requirements for degree courses. (e) _________ entrants don't always need formal qualifications, but need evidence of recent study, (f) _________ work experience or professional qualifications.`,
    options: [
      { id: "A", text: "a: acquired" },
      { id: "B", text: "b: specific" },
      { id: "C", text: "c: particular" },
      { id: "D", text: "d: entry" },
      { id: "E", text: "e: Mature / f: relevant" },
    ],
    correctAnswer: "A",
    explanation: "2.1-р даалгавар нь өгүүлбэрийн гишүүн болон үг бүтэх зүй тогтлын дагуу үгийн аймгийг зөв хэлбэрт оруулах чадварыг шалгадаг.",
    subBlanks: [
      {
        id: "2.1-a",
        label: "a",
        points: 1,
        options:
          variant === "D"
            ? [
                { id: "1", text: "acquired" },
                { id: "2", text: "acquisition" },
                { id: "3", text: "acquire" },
                { id: "4", text: "acquirable" },
                { id: "5", text: "acquiring" },
              ]
            : [
                { id: "1", text: "acquire" },
                { id: "2", text: "acquisition" },
                { id: "3", text: "acquired" },
                { id: "4", text: "acquirable" },
                { id: "5", text: "acquiring" },
              ],
        correctAnswer: variant === "D" ? "1" : "3",
      },
      {
        id: "2.1-b",
        label: "b",
        points: 1,
        options:
          variant === "D"
            ? [
                { id: "1", text: "specification" },
                { id: "2", text: "specify" },
                { id: "3", text: "specific" },
                { id: "4", text: "specifically" },
                { id: "5", text: "specificity" },
              ]
            : [
                { id: "1", text: "specify" },
                { id: "2", text: "specific" },
                { id: "3", text: "specification" },
                { id: "4", text: "specifically" },
                { id: "5", text: "specificity" },
              ],
        correctAnswer: variant === "D" ? "3" : "2",
      },
      {
        id: "2.1-c",
        label: "c",
        points: 1,
        options:
          variant === "D"
            ? [
                { id: "1", text: "particularize" },
                { id: "2", text: "particularity" },
                { id: "3", text: "particularly" },
                { id: "4", text: "unparticular" },
                { id: "5", text: "particular" },
              ]
            : [
                { id: "1", text: "particularly" },
                { id: "2", text: "particularity" },
                { id: "3", text: "particular" },
                { id: "4", text: "unparticular" },
                { id: "5", text: "particularize" },
              ],
        correctAnswer: variant === "D" ? "5" : "3",
      },
      {
        id: "2.1-d",
        label: "d",
        points: 1,
        options:
          variant === "D"
            ? [
                { id: "1", text: "entry" },
                { id: "2", text: "entrant" },
                { id: "3", text: "entered" },
                { id: "4", text: "enter" },
                { id: "5", text: "entering" },
              ]
            : [
                { id: "1", text: "entrant" },
                { id: "2", text: "entry" },
                { id: "3", text: "entered" },
                { id: "4", text: "enter" },
                { id: "5", text: "entering" },
              ],
        correctAnswer: variant === "D" ? "1" : "2",
      },
      {
        id: "2.1-e",
        label: "e",
        points: 1,
        options:
          variant === "D"
            ? [
                { id: "1", text: "Maturity" },
                { id: "2", text: "Mature" },
                { id: "3", text: "Immature" },
                { id: "4", text: "Maturation" },
                { id: "5", text: "Maturely" },
              ]
            : [
                { id: "1", text: "Maturely" },
                { id: "2", text: "Maturity" },
                { id: "3", text: "Immature" },
                { id: "4", text: "Maturation" },
                { id: "5", text: "Mature" },
              ],
        correctAnswer: variant === "D" ? "2" : "5",
      },
      {
        id: "2.1-f",
        label: "f",
        points: 1,
        options:
          variant === "D"
            ? [
                { id: "1", text: "irrelevant" },
                { id: "2", text: "relevance" },
                { id: "3", text: "relevantly" },
                { id: "4", text: "relevant" },
                { id: "5", text: "irrelevance" },
              ]
            : [
                { id: "1", text: "relevant" },
                { id: "2", text: "relevance" },
                { id: "3", text: "relevantly" },
                { id: "4", text: "irrelevant" },
                { id: "5", text: "irrelevance" },
              ],
        correctAnswer: variant === "D" ? "4" : "1",
      },
    ],
  };

  // 2.2 Matching (Definitions 4 pts + Synonyms 4 pts = 8 pts)
  const q2_2: Question = {
    id: `esh-2026-${variant.toLowerCase()}-task-2-2`,
    questionNumber: 49,
    text: `Match the words with their DEFINITIONS and SYNONYMS. There is one extra option in each group.`,
    category: "Vocabulary",
    topic: "Matching: Definitions & Synonyms",
    subtopic: "Advanced Vocabulary Matching",
    difficulty: "Hard",
    points: 8,
    section: 2,
    taskNumber: "2.2",
    taskTitle: "Matching Definitions & Synonyms",
    taskInstruction: "Үгсийг утгын тайлбар болон ойролцоо утгатай үгтэй нь зөв харгалзуулна уу. Нэг илүү хувилбар бий.",
    pointFormula: "/4x1=4 + 4x1=4 = 8 points/",
    options: [
      { id: "A", text: "Definitions: a-3, b-5, c-1, d-2" },
      { id: "B", text: "Synonyms: e-1, f-5, g-4, h-3" },
      { id: "C", text: "Group 1 matched successfully" },
      { id: "D", text: "Group 2 matched successfully" },
      { id: "E", text: "All 8 pairs matched" },
    ],
    correctAnswer: "A",
    explanation: "2.2-р даалгавар нь академик үгсийн англи тайлбар болон ойролцоо утгат үгсийг ялган харгалзуулах чадварыг 8 оноогоор дүгнэнэ.",
    matchingGroups: [
      {
        id: "2.2-definitions",
        title: "Match the words with their DEFINITIONS (There is one extra definition)",
        pointFormula: "/4x1=4 points/",
        points: 4,
        leftItems: [
          { id: "a", label: "a", text: "solidarity" },
          { id: "b", label: "b", text: "indigenous" },
          { id: "c", label: "c", text: "resilient" },
          { id: "d", label: "d", text: "cognition" },
        ],
        rightItems: [
          { id: "1", label: "1", text: "able to quickly return to a previous condition" },
          { id: "2", label: "2", text: "mental process" },
          { id: "3", label: "3", text: "agreement between and support for the member of a group" },
          { id: "4", label: "4", text: "ability to be continued" },
          { id: "5", label: "5", text: "naturally existing in a place or country" },
        ],
        correctPairs: {
          a: "3", // solidarity -> agreement and support
          b: "5", // indigenous -> naturally existing
          c: "1", // resilient -> quickly return to previous condition
          d: "2", // cognition -> mental process
        },
      },
      {
        id: "2.2-synonyms",
        title: "Match the words with their SYNONYMS (There is one extra word)",
        pointFormula: "/4x1=4 points/",
        points: 4,
        leftItems: [
          { id: "e", label: "e", text: "to defeat" },
          { id: "f", label: "f", text: "to inhabit" },
          { id: "g", label: "g", text: "to elevate" },
          { id: "h", label: "h", text: "to advocate" },
        ],
        rightItems:
          variant === "A"
            ? [
                { id: "1", label: "1", text: "to raise" },
                { id: "2", label: "2", text: "to charge" },
                { id: "3", label: "3", text: "to live" },
                { id: "4", label: "4", text: "to support" },
                { id: "5", label: "5", text: "to conquer" },
              ]
            : [
                { id: "1", label: "1", text: "to conquer" },
                { id: "2", label: "2", text: "to charge" },
                { id: "3", label: "3", text: "to support" },
                { id: "4", label: "4", text: "to raise" },
                { id: "5", label: "5", text: "to live" },
              ],
        correctPairs:
          variant === "A"
            ? {
                e: "5", // to defeat -> to conquer
                f: "3", // to inhabit -> to live
                g: "1", // to elevate -> to raise
                h: "4", // to advocate -> to support
              }
            : {
                e: "1", // to defeat -> to conquer
                f: "5", // to inhabit -> to live
                g: "4", // to elevate -> to raise
                h: "3", // to advocate -> to support
              },
      },
    ],
  };

  // 2.3 Cloze Multiple Choice (6 items x 1 = 6 pts)
  const q2_3: Question = {
    id: `esh-2026-${variant.toLowerCase()}-task-2-3`,
    questionNumber: 50,
    text: `Read the short passage and choose the best word to fit in each blank.`,
    category: "Reading",
    topic: "Cloze Multiple Choice",
    subtopic: "Contextual Vocabulary & Syntax",
    difficulty: "Medium",
    points: 6,
    section: 2,
    taskNumber: "2.3",
    taskTitle: "Cloze Multiple Choice",
    taskInstruction: "Богино эхийг уншаад цэгийн оронд тохирох үгийг сонгоно уу.",
    pointFormula: "/6x1=6 points/",
    readingPassage: `The night sky can be incredible. The most obvious thing is the moon which, when full, can be very (a)_______and light up the sky. If we’re lucky, we can also see planets such as Mercury, Venus, Mars and Jupiter, although it (b)________ on the time of year of course.
Another amazing (c)_______is the stars. These can be (d) ________to see if we’re in the middle of a town or city. However, away from city lights, we might see hundreds or even thousands of them. If we have a (e)________enough telescope, we can get a really close look at them, too. It’s (f) _______to think that the stars we see on Earth have actually died. I don’t really understand the science, but apparently, because of the speed of light, we’re actually looking into the past. I think that’s pretty awesome.`,
    options: [
      { id: "A", text: "a: bright, b: depends, c: sight, d: difficult, e: powerful, f: interesting" },
      { id: "B", text: "Passage cloze fully completed" },
      { id: "C", text: "Option C" },
      { id: "D", text: "Option D" },
      { id: "E", text: "Option E" },
    ],
    correctAnswer: "A",
    explanation: "2.3-р даалгавар нь контекстэд тохирох утгыг оновчтой сонгож эхийн уялдаа холбоог ойлгох чадварыг 6 оноогоор үнэлнэ.",
    subBlanks: [
      {
        id: "2.3-a",
        label: "a",
        points: 1,
        options:
          variant === "D"
            ? [
                { id: "1", text: "fair" },
                { id: "2", text: "mild" },
                { id: "3", text: "bright" },
                { id: "4", text: "severe" },
                { id: "5", text: "humid" },
              ]
            : [
                { id: "1", text: "mild" },
                { id: "2", text: "bright" },
                { id: "3", text: "fair" },
                { id: "4", text: "severe" },
                { id: "5", text: "humid" },
              ],
        correctAnswer: variant === "D" ? "3" : "2",
      },
      {
        id: "2.3-b",
        label: "b",
        points: 1,
        options:
          variant === "D"
            ? [
                { id: "1", text: "relies" },
                { id: "2", text: "depends" },
                { id: "3", text: "focuses" },
                { id: "4", text: "decides" },
                { id: "5", text: "concentrates" },
              ]
            : [
                { id: "1", text: "depends" },
                { id: "2", text: "relies" },
                { id: "3", text: "focuses" },
                { id: "4", text: "decides" },
                { id: "5", text: "concentrates" },
              ],
        correctAnswer: variant === "D" ? "2" : "1",
      },
      {
        id: "2.3-c",
        label: "c",
        points: 1,
        options:
          variant === "D"
            ? [
                { id: "1", text: "stage" },
                { id: "2", text: "view" },
                { id: "3", text: "display" },
                { id: "4", text: "show" },
                { id: "5", text: "sight" },
              ]
            : [
                { id: "1", text: "display" },
                { id: "2", text: "view" },
                { id: "3", text: "sight" },
                { id: "4", text: "show" },
                { id: "5", text: "stage" },
              ],
        correctAnswer: variant === "D" ? "5" : "3",
      },
      {
        id: "2.3-d",
        label: "d",
        points: 1,
        options:
          variant === "D"
            ? [
                { id: "1", text: "open" },
                { id: "2", text: "sure" },
                { id: "3", text: "difficult" },
                { id: "4", text: "confusing" },
                { id: "5", text: "different" },
              ]
            : [
                { id: "1", text: "different" },
                { id: "2", text: "sure" },
                { id: "3", text: "open" },
                { id: "4", text: "confusing" },
                { id: "5", text: "difficult" },
              ],
        correctAnswer: variant === "D" ? "3" : "5",
      },
      {
        id: "2.3-e",
        label: "e",
        points: 1,
        options: [
          { id: "1", text: "special" },
          { id: "2", text: "rare" },
          { id: "3", text: "circle" },
          { id: "4", text: "powerful" },
          { id: "5", text: "typical" },
        ],
        correctAnswer: "4",
      },
      {
        id: "2.3-f",
        label: "f",
        points: 1,
        options:
          variant === "D"
            ? [
                { id: "1", text: "brave" },
                { id: "2", text: "positive" },
                { id: "3", text: "advertising" },
                { id: "4", text: "clear" },
                { id: "5", text: "interesting" },
              ]
            : [
                { id: "1", text: "advertising" },
                { id: "2", text: "positive" },
                { id: "3", text: "interesting" },
                { id: "4", text: "clear" },
                { id: "5", text: "brave" },
              ],
        correctAnswer: variant === "D" ? "5" : "3",
      },
    ],
  };

  return [q2_1, q2_2, q2_3];
}

// Generate complete official 2026 Variant data
export function createOfficial2026Variant(variant: "A" | "B" | "C" | "D"): Exam {
  const isPassageTweenbots = variant === "A" || variant === "D";
  const passageContent = isPassageTweenbots
    ? PASSAGE_TWEENBOTS
    : PASSAGE_NATURALLY_BETTER_HOMES;

  // Build Section 1 (47 items, 80 points)
  const sec1Questions: Question[] = [];

  // TASK 1: Grammar (1-6) - 6x1=6 pts
  const t1Data = [
    {
      num: 1,
      text: "I made ________ biscuits this morning. Would you like to try one?",
      options:
        variant === "D"
          ? [
              { id: "A", text: "a few" },
              { id: "B", text: "a lot" },
              { id: "C", text: "a little" },
              { id: "D", text: "little" },
              { id: "E", text: "much" },
            ]
          : variant === "A"
          ? [
              { id: "A", text: "few" },
              { id: "B", text: "much" },
              { id: "C", text: "a few" },
              { id: "D", text: "many" },
              { id: "E", text: "a" },
            ]
          : [
              { id: "A", text: "a little" },
              { id: "B", text: "a lot" },
              { id: "C", text: "a few" },
              { id: "D", text: "little" },
              { id: "E", text: "much" },
            ],
      ans: variant === "D" ? "A" : "C",
      exp: "Biscuits нь тоологдох нэр үг тул өгүүлбэрийн эерэг утгад 'a few' (хэдэн) тохирно.",
    },
    {
      num: 2,
      text: "It’s not so cold ________ it was yesterday.",
      options: [
        { id: "A", text: variant === "D" ? "such" : "as" },
        { id: "B", text: variant === "D" ? "as" : "such" },
        { id: "C", text: "more" },
        { id: "D", text: "like" },
        { id: "E", text: "much" },
      ],
      ans: variant === "D" ? "B" : "A",
      exp: "not so ... as бүтэц нь хоёр зүйлийг чанарын хувьд харьцуулахад хэрэглэгддэг.",
    },
    {
      num: 3,
      text: "My sister kept telling _________ that nothing was wrong.",
      options: [
        { id: "A", text: "herself" },
        { id: "B", text: "themselves" },
        { id: "C", text: "yourself" },
        { id: "D", text: "ourselves" },
        { id: "E", text: "himself" },
      ],
      ans: "A",
      exp: "My sister (гуравдугаар бие, эмэгтэй) тул өөртөө хамаатуулах төлөөний үг 'herself' зөв.",
    },
    {
      num: 4,
      text: "The college is ________ recommended for its range of courses.",
      options: [
        { id: "A", text: "high" },
        { id: "B", text: "highly" },
        { id: "C", text: "higher" },
        { id: "D", text: "highest" },
        { id: "E", text: "more highly" },
      ],
      ans: "B",
      exp: "'highly recommended' (өндрөөр санал болгосон) нь тогтсон нийлмэл үг хэллэг ба дайвар үг шаардагдана.",
    },
    {
      num: 5,
      text: "Sandra has wonderful taste ________ clothes.",
      options: [
        { id: "A", text: "at" },
        { id: "B", text: "of" },
        { id: "C", text: "in" },
        { id: "D", text: "about" },
        { id: "E", text: "from" },
      ],
      ans: "C",
      exp: "have taste in something (ямар нэг зүйлд мэдрэмжтэй, сонирхолтой) угтвар үг нь 'in' байдаг.",
    },
    {
      num: 6,
      text: "John: You ______ put that shirt in the washing machine.\nMary: I know. It has to be dry-cleaned.",
      options: [
        { id: "A", text: "should" },
        { id: "B", text: "mustn’t" },
        { id: "C", text: "could" },
        { id: "D", text: "couldn’t" },
        { id: "E", text: "may" },
      ],
      ans: "B",
      exp: "Хувцсыг угаалгын машинд хийж болохгүй (хориглосон утга) тул модаль үйл үг 'mustn’t' зөв.",
    },
  ];

  t1Data.forEach((item) => {
    sec1Questions.push({
      id: `esh-2026-${variant.toLowerCase()}-q-${item.num}`,
      questionNumber: item.num,
      text: item.text,
      category: "Grammar",
      topic: "Basic Grammar & Modals",
      subtopic: "Grammar Structures",
      difficulty: "Easy",
      points: 1,
      section: 1,
      taskNumber: "Task 1",
      taskTitle: "Choose the correct answers",
      pointFormula: "/6x1=6 points/",
      options: item.options as any,
      correctAnswer: item.ans,
      explanation: item.exp,
    });
  });

  // TASK 2: Grammar (7-13) - 7x2=14 pts
  const t2Data = [
    {
      num: 7,
      text: "Tina: I’m really excited about the trip to Barbados.\nMatt: This time next week, we__________ in the Caribbean!",
      options: [
        { id: "A", text: "are swimming" },
        { id: "B", text: "will have swum" },
        { id: "C", text: "swim" },
        { id: "D", text: "will be swimming" },
        { id: "E", text: "will have been swimming" },
      ],
      ans: "D",
      exp: "'This time next week' нь ирээдүйд тодорхой цагт үргэлжилж байх үйл явдлыг заах тул Future Continuous (will be swimming) тохирно.",
    },
    {
      num: 8,
      text: "Toby said: “I have to tidy my bedroom now.”",
      options: [
        { id: "A", text: "Toby said that he has to tidy his bedroom now." },
        { id: "B", text: "Toby said that he has to tidy his bedroom then." },
        { id: "C", text: "Toby said that he had to tidy his bedroom now." },
        { id: "D", text: "Toby said that he had to tidy my bedroom then." },
        { id: "E", text: "Toby said that he had to tidy his bedroom then." },
      ],
      ans: "E",
      exp: "Хөндлөнгийн ярианд (Reported Speech): 'have to' -> 'had to', 'now' -> 'then', 'my' -> 'his' болж хувирна.",
    },
    {
      num: 9,
      text: "Hurry up and finish _____your lunch; the TV show starts in 10 minutes.",
      options: [
        { id: "A", text: "eating" },
        { id: "B", text: "be eating" },
        { id: "C", text: "to eat" },
        { id: "D", text: "to eating" },
        { id: "E", text: "eat" },
      ],
      ans: "A",
      exp: "'finish' үйл үгийн араас герунд буюу V-ing ордог дүрэмтэй.",
    },
    {
      num: 10,
      text: "Put those clothes in a pile for ________.",
      options: [
        { id: "A", text: "iron" },
        { id: "B", text: "to ironing" },
        { id: "C", text: "ironed" },
        { id: "D", text: "to iron" },
        { id: "E", text: "ironing" },
      ],
      ans: "E",
      exp: "'for' угтвар үгийн дараа герунд хэлбэр (ironing) бичигдэнэ.",
    },
    {
      num: 11,
      text: "Rose: Did you watch the film yesterday?\nKerry: No. It_______ by the time we got there.",
      options: [
        { id: "A", text: "finished" },
        { id: "B", text: "had finished" },
        { id: "C", text: "was finishing" },
        { id: "D", text: "has been finishing" },
        { id: "E", text: "was finished" },
      ],
      ans: "B",
      exp: "'by the time + Past Simple' илэрхийлэлд нөгөө үйлдэл нь өмнө нь болж өнгөрсөн тул Past Perfect (had finished) тохирно.",
    },
    {
      num: 12,
      text: "My grandfather had a(n)__________ sofa in his guest room.",
      options: [
        { id: "A", text: "ugly, velvet, orange" },
        { id: "B", text: "orange, ugly, velvet" },
        { id: "C", text: "orange, velvet, ugly" },
        { id: "D", text: "ugly, orange, velvet" },
        { id: "E", text: "velvet, ugly, orange" },
      ],
      ans: "D",
      exp: "Тэмдэг нэрийн дараалал: Opinion (ugly) + Color (orange) + Material (velvet).",
    },
    {
      num: 13,
      text: "Evan: Did you stay up late last night?\nElla: No. I ___________all day, so I went to bed early.",
      options: [
        { id: "A", text: "worked" },
        { id: "B", text: "had been working" },
        { id: "C", text: "was working" },
        { id: "D", text: "have worked" },
        { id: "E", text: "would be working" },
      ],
      ans: "B",
      exp: "Өнгөрсөнд орондоо орохоос өмнө өдөржин ажиллаж үргэлжилсэн үйл явц тул Past Perfect Continuous (had been working) зөв.",
    },
  ];

  t2Data.forEach((item) => {
    sec1Questions.push({
      id: `esh-2026-${variant.toLowerCase()}-q-${item.num}`,
      questionNumber: item.num,
      text: item.text,
      category: "Grammar",
      topic: "Tenses & Reported Speech",
      subtopic: "Complex Grammar Structures",
      difficulty: "Medium",
      points: 2,
      section: 1,
      taskNumber: "Task 2",
      taskTitle: "Choose the correct answers",
      pointFormula: "/7x2=14 points/",
      options: item.options as any,
      correctAnswer: item.ans,
      explanation: item.exp,
    });
  });

  // TASK 3: Grammar (14-16) - 3x2=6 pts
  const t3Data = [
    {
      num: 14,
      text: "Stuart: If only I _________ those shoes we saw yesterday.\nSandy: Why not go back and buy them tomorrow?",
      options: [
        { id: "A", text: "buy" },
        { id: "B", text: "have bought" },
        { id: "C", text: "had bought" },
        { id: "D", text: "can buy" },
        { id: "E", text: "will buy" },
      ],
      ans: "C",
      exp: "'If only + Past Perfect' нь өнгөрсөнд хийгээгүй зүйлдээ харамсаж буй илэрхийлэл (had bought).",
    },
    {
      num: 15,
      text: "The newest collection won’t be ready on time _______ the delivery of materials was seriously delayed.",
      options: [
        { id: "A", text: "due to the fact that" },
        { id: "B", text: "due the fact" },
        { id: "C", text: "owing to" },
        { id: "D", text: "due to" },
        { id: "E", text: "because of" },
      ],
      ans: "A",
      exp: "Бүтэн өгүүлбэр (subject + verb) залгагдаж байгаа тул 'due to the fact that' холбоос тохирно.",
    },
    {
      num: 16,
      text: "He took out a photo of his son, ________ he adores.",
      options: [
        { id: "A", text: "when" },
        { id: "B", text: "which" },
        { id: "C", text: "whose" },
        { id: "D", text: "where" },
        { id: "E", text: "whom" },
      ],
      ans: "E",
      exp: "Хүн заасан тусагдахууны харьцааны төлөөний үг нь 'whom' юм.",
    },
  ];

  t3Data.forEach((item) => {
    sec1Questions.push({
      id: `esh-2026-${variant.toLowerCase()}-q-${item.num}`,
      questionNumber: item.num,
      text: item.text,
      category: "Grammar",
      topic: "Conditionals & Conjunctions",
      subtopic: "Advanced Clauses",
      difficulty: "Hard",
      points: 2,
      section: 1,
      taskNumber: "Task 3",
      taskTitle: "Choose the correct answers",
      pointFormula: "/3x2=6 points/",
      options: item.options as any,
      correctAnswer: item.ans,
      explanation: item.exp,
    });
  });

  // TASK 4: Error Identification (17-18) - 2x3=6 pts
  const t4Data = [
    {
      num: 17,
      text: "When two products are basically the same as (B), advertising can influence the public’s choice.",
      underlinedSentence: "When two products(A) are basically the same as(B), advertising can influence(C) the public's choice(D).",
      options: [
        { id: "A", text: "A - two products" },
        { id: "B", text: "B - the same as" },
        { id: "C", text: "C - can influence" },
        { id: "D", text: "D - the public's choice" },
        { id: "E", text: "E - No error" },
      ],
      ans: "B",
      exp: "Өгүүлбэрийн төгсгөлд харьцуулах зүйлгүй тул 'the same as' биш зүгээр 'the same' байх ёстой.",
    },
    {
      num: 18,
      text: "Everyone who has travelled across the United States by car, train, or bus are (D) surprised to see such a large expanse of territory...",
      underlinedSentence: "Everyone who has travelled(A) across the United States(B) by car, train, or bus(C) are surprised(D) to see such a large expanse of territory...",
      options: [
        { id: "A", text: "A - has travelled" },
        { id: "B", text: "B - across" },
        { id: "C", text: "C - by car" },
        { id: "D", text: "D - are surprised" },
        { id: "E", text: "E - among" },
      ],
      ans: "D",
      exp: "'Everyone' нь ганц тооны төлөөний үг тул үйл үг нь олон тооны 'are' биш ганц тооны 'is surprised' байх ёстой.",
    },
  ];

  t4Data.forEach((item) => {
    sec1Questions.push({
      id: `esh-2026-${variant.toLowerCase()}-q-${item.num}`,
      questionNumber: item.num,
      text: item.text,
      category: "Grammar",
      topic: "Error Identification",
      subtopic: "Subject-Verb Agreement & Prepositions",
      difficulty: "Hard",
      points: 3,
      section: 1,
      taskNumber: "Task 4",
      taskTitle: "Identify the underlined part that should be corrected in each sentence",
      pointFormula: "/2x3=6 points/",
      underlinedSentence: item.underlinedSentence,
      options: item.options as any,
      correctAnswer: item.ans,
      explanation: item.exp,
    });
  });

  // VOCABULARY SECTION (19-33)
  // Task 1: Vocabulary MCQ (19-27) - 9x1=9 pts
  const vocabT1Data = [
    {
      num: 19,
      text: "The daughter of your sister or brother is your ________.",
      options: [
        { id: "A", text: "aunt" },
        { id: "B", text: "nephew" },
        { id: "C", text: "sibling" },
        { id: "D", text: "couple" },
        { id: "E", text: "niece" },
      ],
      ans: "E",
      exp: "Эгч эсвэл ахын охин хүүхдийг 'niece' (зээ охин / ач охин) гэж нэрлэдэг.",
    },
    {
      num: 20,
      text: "An electric vehicle that transports people is a _________.",
      options: [
        { id: "A", text: "ferry" },
        { id: "B", text: "van" },
        { id: "C", text: "trolley" },
        { id: "D", text: "truck" },
        { id: "E", text: "helicopter" },
      ],
      ans: "C",
      exp: "Цахилгаанаар зорчигч тээвэрлэдэг нийтийн тээврийн хэрэгсэл нь 'trolley' юм.",
    },
    {
      num: 21,
      text: "My trousers are a bit loose, so I bought a leather __________.",
      options: [
        { id: "A", text: "wrist-band" },
        { id: "B", text: "belt" },
        { id: "C", text: "tie" },
        { id: "D", text: "key ring" },
        { id: "E", text: "cufflink" },
      ],
      ans: "B",
      exp: "Өмд суларсан үед өмсдөг савхин хэрэглэл нь 'belt' (бүс) юм.",
    },
    {
      num: 22,
      text: "A _________ person takes care to avoid risks.",
      options: [
        { id: "A", text: "cautious" },
        { id: "B", text: "dominant" },
        { id: "C", text: "charming" },
        { id: "D", text: "creative" },
        { id: "E", text: "punctual" },
      ],
      ans: "A",
      exp: "Эрсдэлээс болгоомжилдог хүнийг 'cautious' (хянуур, болгоомжтой) гэнэ.",
    },
    {
      num: 23,
      text: "Match the verb “to consume” with the synonym.",
      options: [
        { id: "A", text: "to crane" },
        { id: "B", text: "to worship" },
        { id: "C", text: "to establish" },
        { id: "D", text: "to allow" },
        { id: "E", text: "to use" },
      ],
      ans: "E",
      exp: "'to consume' (хэрэглэх, зарцуулах) үгийн ойролцоо утга нь 'to use'.",
    },
    {
      num: 24,
      text: "Choose the opposite of the phrase “out of curiosity”.",
      options: [
        { id: "A", text: "interesting" },
        { id: "B", text: "with no interest" },
        { id: "C", text: "elegant" },
        { id: "D", text: "relaxed" },
        { id: "E", text: "charming" },
      ],
      ans: "B",
      exp: "'out of curiosity' (сониуч зандаа хөтлөгдөн) хэллэгийн эсрэг утга нь 'with no interest'.",
    },
    {
      num: 25,
      text: "After all the visitors had left, she experienced a feeling of complete ______.",
      options: [
        { id: "A", text: "expression" },
        { id: "B", text: "compassion" },
        { id: "C", text: "exposure" },
        { id: "D", text: "isolation" },
        { id: "E", text: "submission" },
      ],
      ans: "D",
      exp: "Бүх зочид явсны дараа ганцаардах, тусгаарлагдсан мэдрэмж төрөх тул 'isolation' зөв.",
    },
    {
      num: 26,
      text: "The new laws don’t seem _______with the government’s whole policy on education.",
      options: [
        { id: "A", text: "compatible" },
        { id: "B", text: "comfortable" },
        { id: "C", text: "academic" },
        { id: "D", text: "efficient" },
        { id: "E", text: "incredible" },
      ],
      ans: "A",
      exp: "'compatible with' нь нийцэх, зохицох утгатай үг.",
    },
    {
      num: 27,
      text: "I _______ my mother very closely.",
      options: [
        { id: "A", text: "assemble" },
        { id: "B", text: "resemble" },
        { id: "C", text: "applause" },
        { id: "D", text: "survive" },
        { id: "E", text: "admire" },
      ],
      ans: "B",
      exp: "'resemble closely' (маш адилхан харагдах, дуурайх) гэсэн үг хэллэг тохирно.",
    },
  ];

  vocabT1Data.forEach((item) => {
    sec1Questions.push({
      id: `esh-2026-${variant.toLowerCase()}-q-${item.num}`,
      questionNumber: item.num,
      text: item.text,
      category: "Vocabulary",
      topic: "General Vocabulary",
      subtopic: "Word Choice & Synonyms",
      difficulty: "Medium",
      points: 1,
      section: 1,
      taskNumber: "Task 1",
      taskTitle: "Choose the correct answers",
      pointFormula: "/9x1=9 points/",
      options: item.options as any,
      correctAnswer: item.ans,
      explanation: item.exp,
    });
  });

  // Task 2: Phrasal verbs (28-29) - 2x2=4 pts
  const vocabT2Data = [
    {
      num: 28,
      text: "If I can’t put up with something, I can’t __________ it.",
      options: [
        { id: "A", text: "describe" },
        { id: "B", text: "admire" },
        { id: "C", text: "stand" },
        { id: "D", text: "promise" },
        { id: "E", text: "construct" },
      ],
      ans: "C",
      exp: "'put up with' хэллэг үйл үг нь 'тэвчих, тэсэх' буюу 'stand' утгатай адил.",
    },
    {
      num: 29,
      text: "To draw up the contract is to ___________ the contract.",
      options: [
        { id: "A", text: "refuse" },
        { id: "B", text: "sign" },
        { id: "C", text: "look over" },
        { id: "D", text: "lose" },
        { id: "E", text: "prepare" },
      ],
      ans: "E",
      exp: "'to draw up a contract' нь гэрээний төсөл боловсруулах, бэлтгэх буюу 'to prepare'.",
    },
  ];

  vocabT2Data.forEach((item) => {
    sec1Questions.push({
      id: `esh-2026-${variant.toLowerCase()}-q-${item.num}`,
      questionNumber: item.num,
      text: item.text,
      category: "Vocabulary",
      topic: "Phrasal Verbs",
      subtopic: "Idiomatic Expressions",
      difficulty: "Medium",
      points: 2,
      section: 1,
      taskNumber: "Task 2",
      taskTitle: "Choose the correct meaning of the underlined phrasal verbs",
      pointFormula: "/2x2=4 points/",
      options: item.options as any,
      correctAnswer: item.ans,
      explanation: item.exp,
    });
  });

  // Task 3: Collocations (30-31) - 2x2=4 pts
  const vocabT3Data = [
    {
      num: 30,
      text: "A _________ of medicine / of flu / of penicillin",
      options: [
        { id: "A", text: "lump" },
        { id: "B", text: "course" },
        { id: "C", text: "carton" },
        { id: "D", text: "dose" },
        { id: "E", text: "bar" },
      ],
      ans: "D",
      exp: "Эм, тарианы тунг 'dose of medicine / dose of penicillin' гэж хоршин хэрэглэдэг.",
    },
    {
      num: 31,
      text: "to pass up the / to take a / to get the / to stand a __________",
      options: [
        { id: "A", text: "attention" },
        { id: "B", text: "chance" },
        { id: "C", text: "care" },
        { id: "D", text: "hill" },
        { id: "E", text: "post" },
      ],
      ans: "B",
      exp: "'take a chance', 'pass up the chance', 'stand a chance' зэрэгт 'chance' (боломж) хоршино.",
    },
  ];

  vocabT3Data.forEach((item) => {
    sec1Questions.push({
      id: `esh-2026-${variant.toLowerCase()}-q-${item.num}`,
      questionNumber: item.num,
      text: item.text,
      category: "Vocabulary",
      topic: "Collocations",
      subtopic: "Word Partnerships",
      difficulty: "Medium",
      points: 2,
      section: 1,
      taskNumber: "Task 3",
      taskTitle: "Choose the most suitable word to complete each collocation",
      pointFormula: "/2x2=4 points/",
      options: item.options as any,
      correctAnswer: item.ans,
      explanation: item.exp,
    });
  });

  // Task 4: Idioms & Situations (32-33) - 2x3=6 pts
  const vocabT4Data = [
    {
      num: 32,
      text: "Situation: Susan took an English exam, and she is waiting anxiously to know how well she had done.\nWhich of the following idioms best describes Susan’s action in this situation?",
      options: [
        { id: "A", text: "to see the light" },
        { id: "B", text: "to chicken out" },
        { id: "C", text: "to sweat out" },
        { id: "D", text: "to give a ring" },
        { id: "E", text: "to break the ice" },
      ],
      ans: "C",
      exp: "Шалгалтынхаа дүнг тэвчээргүй, санаа зовнин хүлээхийг 'to sweat out' хэлцээр илэрхийлдэг.",
    },
    {
      num: 33,
      text: "Situation: Susan and David had a big argument last month and stopped talking to each other. Last week, Susan saw David at the train station, smiled, and asked how his job was going. David smiled back and they chatted for an hour.\nWhich of the following idioms best describes Susan’s action in this situation?",
      options: [
        { id: "A", text: "to burn up the road" },
        { id: "B", text: "to hit the jackpot" },
        { id: "C", text: "to get one’s goat" },
        { id: "D", text: "to call the shots" },
        { id: "E", text: "to break the ice" },
      ],
      ans: "E",
      exp: "Хүйтэн хөндий байдлыг эвдэж эхэлж яриа өдөх нь 'to break the ice' (мөс хагалах).",
    },
  ];

  vocabT4Data.forEach((item) => {
    sec1Questions.push({
      id: `esh-2026-${variant.toLowerCase()}-q-${item.num}`,
      questionNumber: item.num,
      text: item.text,
      category: "Vocabulary",
      topic: "Idioms in Context",
      subtopic: "Situation Idioms",
      difficulty: "Hard",
      points: 3,
      section: 1,
      taskNumber: "Task 4",
      taskTitle: "Choose the correct answers",
      pointFormula: "/2x3=6 points/",
      options: item.options as any,
      correctAnswer: item.ans,
      explanation: item.exp,
    });
  });

  // SECTION 3: COMMUNICATION (34-38)
  // Task 1: Requests & Dialogues (34-36) - 3x2=6 pts
  const commT1Data = [
    {
      num: 34,
      text: "Situation: Your car’s broken down. A tow truck has come to take your car to the mechanic’s garage. You say to the driver:\nWhat’s the most polite request?",
      options: [
        { id: "A", text: "I’m willing to ride with you to the garage." },
        { id: "B", text: "Could you give me a ride to the garage?" },
        { id: "C", text: "Would you like to give me a ride to the garage?" },
        { id: "D", text: "Give me a ride to the garage!" },
        { id: "E", text: "I want to get my car repaired!" },
      ],
      ans: "B",
      exp: "'Could you give me a ride...?' нь танихгүй жолоочоос эелдэгээр тусламж хүсэх хамгийн зөв хэлбэр юм.",
    },
    {
      num: 35,
      text: "Woman: Have you made up your mind which painting you want yet?\nMan: Mm. I like them both, but this one’s more in my price range.\nWoman: Others are interested, but I can give you till tomorrow. Why don’t you sleep on it and let me know?\nMan: That’s a good idea. Thanks. I’ll do that.\nWhat will the man probably do to the woman’s suggestion?",
      options: [
        { id: "A", text: "He’s likely to go to bed at once." },
        { id: "B", text: "He wants the cheaper of the two paintings." },
        { id: "C", text: "He’s too tired to make a final decision." },
        { id: "D", text: "He’s short of money." },
        { id: "E", text: "He’s going to take time to think about it." },
      ],
      ans: "E",
      exp: "'sleep on it' гэдэг нь 'бодож үзэх, яаралгүй шийдвэр гаргах' гэсэн утгатай хэлц үг юм.",
    },
    {
      num: 36,
      text: "Woman: Tom, Karen’s invited everyone round to her place after work. You coming?\nMan: I said I’d meet Mark later for a coffee and a chat.\nWoman: You could bring him along, too.\nMan: OK. I’ll ask him.\nWhat will Tom probably do?",
      options: [
        { id: "A", text: "Tom can’t meet Mark at Karen’s house after all." },
        { id: "B", text: "Tom and Mark definitely won’t be going for coffee." },
        { id: "C", text: "Tom and Mark might go to Karen’s house." },
        { id: "D", text: "Tom will meet Mark at Karen’s house." },
        { id: "E", text: "Tom will ask Mark to come for a coffee at Karen’s house." },
      ],
      ans: "C",
      exp: "Том Маркаас асуухыг зөвшөөрсөн тул тэд хамтдаа Кареныд очиж магадгүй (might go).",
    },
  ];

  commT1Data.forEach((item) => {
    sec1Questions.push({
      id: `esh-2026-${variant.toLowerCase()}-q-${item.num}`,
      questionNumber: item.num,
      text: item.text,
      category: "Communication",
      topic: "Everyday Dialogues & Situations",
      subtopic: "Polite Requests & Idiomatic Phrases",
      difficulty: "Medium",
      points: 2,
      section: 1,
      taskNumber: "Task 1",
      taskTitle: "Read the conversations and choose the most appropriate answers",
      pointFormula: "/3x2=6 points/",
      options: item.options as any,
      correctAnswer: item.ans,
      explanation: item.exp,
    });
  });

  // Task 2: Inference (37-38) - 2x2=4 pts
  const commT2Data = [
    {
      num: 37,
      text: "Woman: The author gave a great talk about his book, didn’t he?\nMan: I thought he was rather flippant in his remark, actually.\nWoman: Oh, I just thought that was his manner of speaking.\nMan: Well, his book’s so successful, I guess he doesn’t care what people think.\nWhat can be inferred from the man’s opinion about the author?",
      options: [
        { id: "A", text: "He thinks the author is not concerned about other people." },
        { id: "B", text: "He is reluctant to the author’s book." },
        { id: "C", text: "He doesn’t mind the author’s manner of speaking." },
        { id: "D", text: "He thinks the author attempts to be clever." },
        { id: "E", text: "He assumes that the author makes a few remarks on his talk." },
      ],
      ans: "A",
      exp: "'he doesn't care what people think' өгүүлбэр нь зохиолч бусдын санаа бодолд анхаардаггүй болохыг заана.",
    },
    {
      num: 38,
      text: "Susan: Mr. Wilkings, I’ve got to run, but I’m leaving the analysis on your desk.\nMr. Wilkings: OK, thanks Susan. How were the results, by the way?\nSusan: In all likelihood, we’ll have to rerun the test. The results seem inconclusive.\nMr. Wilkings: I see. I was afraid of that. I’ll have a look at it later.\nWhat does Susan mean about the test analysis?",
      options: [
        { id: "A", text: "She will rerun to keep it." },
        { id: "B", text: "She assumes that it needs to be revised." },
        { id: "C", text: "She is likely to look through the test." },
        { id: "D", text: "She is afraid of the test results." },
        { id: "E", text: "She is quitting the job." },
      ],
      ans: "B",
      exp: "'results seem inconclusive, rerun the test' нь туршилтын үр дүнг дахин хийж, хянан өөрчлөх шаардлагатайг харуулж байна.",
    },
  ];

  commT2Data.forEach((item) => {
    sec1Questions.push({
      id: `esh-2026-${variant.toLowerCase()}-q-${item.num}`,
      questionNumber: item.num,
      text: item.text,
      category: "Communication",
      topic: "Conversational Inference",
      subtopic: "Implied Meaning",
      difficulty: "Hard",
      points: 2,
      section: 1,
      taskNumber: "Task 2",
      taskTitle: "Read the conversations and choose the most suitable responses",
      pointFormula: "/2x2=4 points/",
      options: item.options as any,
      correctAnswer: item.ans,
      explanation: item.exp,
    });
  });

  // SECTION 4: READING (39-47)
  // Task 1: Reading MCQ (39-44) - 6x1=6 pts
  const readT1Data = isPassageTweenbots
    ? [
        {
          num: 39,
          text: "What is this reading about?",
          options: [
            { id: "A", text: "An experiment" },
            { id: "B", text: "A place to buy robots" },
            { id: "C", text: "A new kind of toys" },
            { id: "D", text: "An interesting idea for the future" },
            { id: "E", text: "A warm-hearted stranger" },
          ],
          ans: "A",
          exp: "Эхийн гол агуулга нь хүмүүсийн тусч занг туршсан Tweenbots нэртэй нийгмийн туршилт (social experiment)-ын тухай юм.",
        },
        {
          num: 40,
          text: "What is a Tweenbot?",
          options: [
            { id: "A", text: "A small living being" },
            { id: "B", text: "A person from New York City" },
            { id: "C", text: "A pedestrian" },
            { id: "D", text: "A very large machine" },
            { id: "E", text: "A ten-inch smiling robot" },
          ],
          ans: "E",
          exp: "Эхийн 1-р догол мөрөнд: 'ten-inch smiling robot, called a Tweenbot' гэж шууд тодорхойлсон.",
        },
        {
          num: 41,
          text: "How did a Tweenbot get to its final destination? With the help of ___________.",
          options: [
            { id: "A", text: "Kacie Kinzer" },
            { id: "B", text: "other Tweenbots" },
            { id: "C", text: "kind pedestrians on the street" },
            { id: "D", text: "other robots in New York City" },
            { id: "E", text: "kids" },
          ],
          ans: "C",
          exp: "Робот нь зөвхөн гудамжны танихгүй тусч явган зорчигчдын тусламжтайгаар зорьсон газартаа хүрдэг.",
        },
        {
          num: 42,
          text: "Which of the following statements is NOT correct?",
          options: [
            { id: "A", text: "Most people treated Tweenbots in a gentle manner." },
            { id: "B", text: "Most Tweenbots arrived at their destination damaged or broken." },
            { id: "C", text: "Tweenbots could not navigate the city on their own." },
            { id: "D", text: "Tweenbots move at a constant speed and can only go in a straight line." },
            { id: "E", text: "Tweenbots could be knocked down by vehicle." },
          ],
          ans: "B",
          exp: "Эхэд: 'no Tweenbot was lost or damaged, and each one arrived at its target in good condition' гэсэн тул B сонголт буруу (NOT correct).",
        },
        {
          num: 43,
          text: "Tweenbots were __________.",
          options: [
            { id: "A", text: "lent by others" },
            { id: "B", text: "ignored by most people" },
            { id: "C", text: "helpful for pedestrians" },
            { id: "D", text: "bought by many people" },
            { id: "E", text: "useful for research" },
          ],
          ans: "E",
          exp: "Судлаачийн туршилтын хэрэгсэл байсан тул судалгаанд ашигтай (useful for research) байсан.",
        },
        {
          num: 44,
          text: "The verb “navigate” in paragraph 2 is closest in meaning to",
          options: [
            { id: "A", text: "to move" },
            { id: "B", text: "to light" },
            { id: "C", text: "to circle" },
            { id: "D", text: "to direct" },
            { id: "E", text: "to arrive" },
          ],
          ans: "A",
          exp: "'navigate the city' гэдэг нь хот дотор замаа олж шилжих, явах (to move) гэсэн утгатай.",
        },
      ]
    : [
        {
          num: 39,
          text: "What is the main idea of this reading?",
          options: [
            { id: "A", text: "Earthships are in many different countries." },
            { id: "B", text: "Environmentalists are concerned about energy." },
            { id: "C", text: "Earthships are environmentally friendly homes." },
            { id: "D", text: "Earthships look like typical houses." },
            { id: "E", text: "Earthships save energy." },
          ],
          ans: "C",
          exp: "Эхийн ерөнхий гол санаа нь байгальд ээлтэй 'Earthship' сууцнуудын бүтэц, онцлогийн тухай юм.",
        },
        {
          num: 40,
          text: "What is the main building material of earthships?",
          options: [
            { id: "A", text: "cement" },
            { id: "B", text: "old cans and bottles" },
            { id: "C", text: "used cardboard" },
            { id: "D", text: "used tires" },
            { id: "E", text: "concrete" },
          ],
          ans: "D",
          exp: "Эхэд: 'The main construction material of an earthship is used tires that are filled with dirt' гэж заасан.",
        },
        {
          num: 41,
          text: "Why do earthships need less energy to heat and cool them?",
          options: [
            { id: "A", text: "They are more energy efficient." },
            { id: "B", text: "They are built into the ground." },
            { id: "C", text: "They recycle water." },
            { id: "D", text: "They are typically very small." },
            { id: "E", text: "They were made of tires." },
          ],
          ans: "B",
          exp: "Газар дотор зоож барьсан тул дулаан, сэрүүний температурыг тогтмол барьдаг.",
        },
        {
          num: 42,
          text: "In an earthship, old boxes would be used to __________ .",
          options: [
            { id: "A", text: "fill outside walls" },
            { id: "B", text: "recycle water" },
            { id: "C", text: "create fertilizer" },
            { id: "D", text: "build inside walls" },
            { id: "E", text: "pay utility bills" },
          ],
          ans: "A",
          exp: "Дугуй хоорондын зай завсрыг хуучин хайрцаг цаасаар бөглөж гадна ханыг хийдэг.",
        },
        {
          num: 43,
          text: "One benefit of the earthship is ___________ .",
          options: [
            { id: "A", text: "generating electricity" },
            { id: "B", text: "keeping the temperature" },
            { id: "C", text: "solar panels" },
            { id: "D", text: "a facing south wall" },
            { id: "E", text: "a low electricity payment" },
          ],
          ans: "A",
          exp: "Дээвэр дээрх нарны толь нь цахилгаан үйлдвэрлэдэг давуу талтай.",
        },
        {
          num: 44,
          text: "The phrase “environmentally friendly” in paragraph 5 is closest in meaning to",
          options: [
            { id: "A", text: "bad for the environment" },
            { id: "B", text: "good for the environment" },
            { id: "C", text: "made from natural products" },
            { id: "D", text: "found throughout the environment" },
            { id: "E", text: "to make environment clean" },
          ],
          ans: "B",
          exp: "'environmentally friendly' нь 'байгаль орчинд ээлтэй, сайн' буюу 'good for the environment'.",
        },
      ];

  readT1Data.forEach((item) => {
    sec1Questions.push({
      id: `esh-2026-${variant.toLowerCase()}-q-${item.num}`,
      questionNumber: item.num,
      text: item.text,
      category: "Reading",
      topic: "Reading Comprehension",
      subtopic: "Main Idea & Details",
      difficulty: "Medium",
      points: 1,
      section: 1,
      taskNumber: "Task 1",
      taskTitle: "Read the passage and then answer the questions below",
      pointFormula: "/6x1=6 points/",
      readingPassage: passageContent,
      options: item.options as any,
      correctAnswer: item.ans,
      explanation: item.exp,
    });
  });

  // Task 2: Summary Cloze (45-47) - 3x3=9 pts
  const summaryOptions = isPassageTweenbots
    ? [
        { id: "A", text: "inability" },
        { id: "B", text: "lend a hand" },
        { id: "C", text: "successfully" },
        { id: "D", text: "direction" },
        { id: "E", text: "rely on" },
      ]
    : [
        { id: "A", text: "generate" },
        { id: "B", text: "stacking" },
        { id: "C", text: "faced up to" },
        { id: "D", text: "concerned" },
        { id: "E", text: "require" },
      ];

  const readT2Data = isPassageTweenbots
    ? [
        {
          num: 45,
          text: "The Tweenbots experiment is the idea of Kacie Kinzer. Tweenbots are small machines that rely on the kindness of strangers to 45. _________ and help them reach their final destination.",
          ans: "B",
          exp: "Танихгүй хүмүүсийн гар сунган туслах ('lend a hand') дээр суурилдаг.",
        },
        {
          num: 46,
          text: "Each robot’s 46. _________ to turn means that it needs the help of people to navigate the sidewalks of New York.",
          ans: "A",
          exp: "Робот өөрөө эргэж чаддаггүй дутагдалтай чадвар буюу 'inability' тохирно.",
        },
        {
          num: 47,
          text: "With a person’s help, a Tweenbot can continue in the right direction to arrive 47. _________ at its destination.",
          ans: "C",
          exp: "Зорьсон газартаа амжилттай ('successfully') очих.",
        },
      ]
    : [
        {
          num: 45,
          text: "A man who was 45. _________ about the environment came up with the idea of earthships.",
          ans: "D",
          exp: "Байгаль орчинд санаа зовж байсан архитектор тул 'concerned' зөв.",
        },
        {
          num: 46,
          text: "However, the outside walls are made of 46. _________ old tires and putting cardboard between the tires.",
          ans: "B",
          exp: "Дугуйнуудыг хооронд нь давхарлан өрөх буюу 'stacking' тохирно.",
        },
        {
          num: 47,
          text: "Other nice features of an earthship include solar panels that 47. _________ electricity...",
          ans: "A",
          exp: "Цахилгаан эрчим хүч үйлдвэрлэх буюу үүсгэх ('generate') үйл үг тохирно.",
        },
      ];

  readT2Data.forEach((item) => {
    sec1Questions.push({
      id: `esh-2026-${variant.toLowerCase()}-q-${item.num}`,
      questionNumber: item.num,
      text: item.text,
      category: "Reading",
      topic: "Summary Completion",
      subtopic: "Summary Cloze",
      difficulty: "Hard",
      points: 3,
      section: 1,
      taskNumber: "Task 2",
      taskTitle: "Read the summary of the passage and fill in the blanks",
      pointFormula: "/3x3=9 points/",
      readingPassage: passageContent,
      options: summaryOptions as any,
      correctAnswer: item.ans,
      explanation: item.exp,
    });
  });

  // Build Section 2 (3 task groups, 20 points)
  const sec2Questions = buildSection2Questions(variant);

  const allQuestions = [...sec1Questions, ...sec2Questions];

  return {
    id: `esh-2026-${variant.toLowerCase()}`,
    title: `2026 оны ЭЕШ – Англи хэл (Хувилбар ${variant})`,
    year: 2026,
    variant,
    type: "past_paper",
    totalQuestions: allQuestions.length, // 47 Section 1 + 3 Section 2 task groups = 50 total questions
    durationMinutes: 80,
    readingPassage: passageContent,
    questions: allQuestions,
    status: "published",
    createdBy: "usr-admin-1",
    createdByName: "Батцэцэг (Super Admin)",
    createdAt: "2026-03-20T10:00:00Z",
    rawTotalPoints: 100,
    section1Points: 80,
    section2Points: 20,
    isHierarchical2026: true,
  };
}

export const OFFICIAL_2026_EXAMS: Record<"A" | "B" | "C" | "D", Exam> = {
  A: createOfficial2026Variant("A"),
  B: createOfficial2026Variant("B"),
  C: createOfficial2026Variant("C"),
  D: createOfficial2026Variant("D"),
};
