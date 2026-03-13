import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create competition if it doesn't exist
  const competition = await prisma.competition.findFirst();
  if (!competition) {
    await prisma.competition.create({
      data: {
        isActive: true
      }
    });
  }

  // Create default rounds
  const defaultRounds = [
    {
      roundNumber: 0,
      title: "午夜分贝 MIDNIGHT DECIBEL",
      subtitle1: "余温乐队 Yuwen VS Moonlight",
      question: "你是否要为乐队投上一票？Do you want to vote for the band?",
      options: ["Yes", "No"],
      note: "余温乐队 Yuwen",
      isActive: false,
      timeLeft: 0
    },
    {
      roundNumber: 1,
      title: "午夜分贝 MIDNIGHT DECIBEL",
      subtitle1: "余温乐队 Yuwen VS Moonlight", 
      question: "你是否要为乐队投上一票？Do you want to vote for the band?",
      options: ["Yes", "No"],
      note: "Moonlight",
      isActive: false,
      timeLeft: 0
    },
    {
      roundNumber: 2,
      title: "午夜分贝 MIDNIGHT DECIBEL",
      subtitle1: "蓝色渐进 Asym-bLu VS S!mons",
      question: "你是否要为乐队投上一票？Do you want to vote for the band?",
      options: ["Yes", "No"],
      note: "蓝色渐进 Asym-bLu",
      isActive: false,
      timeLeft: 0
    },
    {
      roundNumber: 3,
      title: "午夜分贝 MIDNIGHT DECIBEL",
      subtitle1: "蓝色渐进 Asym-bLu VS S!mons",
      question: "你是否要为乐队投上一票？Do you want to vote for the band?",
      options: ["Yes", "No"],
      note: "S!mons",
      isActive: false,
      timeLeft: 0
    },
    {
      roundNumber: 4,
      title: "午夜分贝 MIDNIGHT DECIBEL",
      subtitle1: "Fine Without VS Fusion Accord",
      question: "你是否要为乐队投上一票？Do you want to vote for the band?",
      options: ["Yes", "No"],
      note: "Fine Without",
      isActive: false,
      timeLeft: 0
    },
    {
      roundNumber: 5,
      title: "午夜分贝 MIDNIGHT DECIBEL",
      subtitle1: "Fine Without VS Fusion Accord",
      question: "你是否要为乐队投上一票？Do you want to vote for the band?",
      options: ["Yes", "No"],
      note: "Fusion Accord",
      isActive: false,
      timeLeft: 0
    },
    {
      roundNumber: 6,
      title: "终章审判 FINAL JUDGEMENT",
      subtitle1: "",
      question: "你是否要为乐队投上一票？Do you want to vote for the band?",
      options: ["Yes", "No"],
      note: "乐队A",
      isActive: false,
      timeLeft: 0
    },
    {
      roundNumber: 7,
      title: "终章审判 FINAL JUDGEMENT",
      subtitle1: "",
      question: "你是否要为乐队投上一票？Do you want to vote for the band?",
      options: ["Yes", "No"],
      note: "乐队A",
      isActive: false,
      timeLeft: 0
    },
    {
      roundNumber: 8,
      title: "终章审判 FINAL JUDGEMENT",
      subtitle1: "",
      question: "你是否要为乐队投上一票？Do you want to vote for the band?",
      options: ["Yes", "No"],
      note: "乐队A",
      isActive: false,
      timeLeft: 0
    }
  ];

  // Delete existing rounds and create new ones
  await prisma.round.deleteMany({});
  for (const round of defaultRounds) {
    await prisma.round.create({
      data: {
        roundNumber: round.roundNumber,
        title: round.title,
        subtitle1: round.subtitle1,
        question: round.question,
        options: JSON.stringify(round.options),
        note: round.note,
        isActive: round.isActive,
        timeLeft: round.timeLeft
      }
    });
  }

  console.log('Database has been seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 