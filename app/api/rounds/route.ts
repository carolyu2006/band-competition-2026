import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultRounds = [
  {
    roundNumber: 0,
    title: "午夜分贝 MIDNIGHT DECIBEL",
    subtitle1: "二选一•Choose One",
    question: "你更喜欢谁的演出？\nWhich performance do you prefer?",
    options: ["余温乐队 Yuwen", "Moonlight"],
    note: "你的选择将关乎乐队是否能在第二轮演奏，请谨慎考虑！\nYour vote determines whether a band advances to Round 2-choose wisely!",
    isActive: false,
    timeLeft: 0
  },
  {
    roundNumber: 1,
    title: "午夜分贝 MIDNIGHT DECIBEL",
    subtitle1: "二选一•Choose One",
    question: "你更喜欢谁的演出？\nWhich performance do you prefer?",
    options: ["蓝色渐进 Asym-bLu", "Accord"],
    note: "你的选择将关乎乐队是否能在第二轮演奏，请谨慎考虑！\nYour vote determines whether a band advances to Round 2-choose wisely!",
    isActive: false,
    timeLeft: 0
  },
  {
    roundNumber: 2,
    title: "午夜分贝 MIDNIGHT DECIBEL",
    subtitle1: "二选一•Choose One",
    question: "你更喜欢谁的演出？\nWhich performance do you prefer?",
    options: ["余温乐队 Yuwen", "蓝色渐进 Asym-bLu"],
    note: "你的选择将关乎乐队是否能在第二轮演奏，请谨慎考虑！\nYour vote determines whether a band advances to Round 2-choose wisely!",
    isActive: false,
    timeLeft: 0
  },
  {
    roundNumber: 3,
    title: "午夜分贝 MIDNIGHT DECIBEL",
    subtitle1: "二选一•Choose One",
    question: "你更喜欢谁的演出？\nWhich performance do you prefer?",
    options: ["Moonlight", "Accord"],
    note: "你的选择将关乎乐队是否能在第二轮演奏，请谨慎考虑！\nYour vote determines whether a band advances to Round 2-choose wisely!",
    isActive: false,
    timeLeft: 0
  },
  {
    roundNumber: 4,
    title: "午夜分贝 MIDNIGHT DECIBEL",
    subtitle1: "二选一•Choose One",
    question: "你更喜欢谁的演出？\nWhich performance do you prefer?",
    options: ["余温乐队 Yuwen", "Accord"],
    note: "你的选择将关乎乐队是否能在第二轮演奏，请谨慎考虑！\nYour vote determines whether a band advances to Round 2-choose wisely!",
    isActive: false,
    timeLeft: 0
  },
  {
    roundNumber: 5,
    title: "午夜分贝 MIDNIGHT DECIBEL",
    subtitle1: "二选一•Choose One",
    question: "你更喜欢谁的演出？\nWhich performance do you prefer?",
    options: ["Moonlight", "蓝色渐进 Asym-bLu"],
    note: "你的选择将关乎乐队是否能在第二轮演奏，请谨慎考虑！\nYour vote determines whether a band advances to Round 2-choose wisely!",
    isActive: false,
    timeLeft: 0
  },
  {
    roundNumber: 6,
    title: "终章审判 FINAL JUDGEMENT",
    subtitle1: "你的YES or NO决定今夜王座归属\nYour YES or NO Decides Tonight's Throne！",
    question: "你是否要为乐队投上一票？\nDo you want to vote for the band?",
    options: ["Yes", "No"],
    note: "",
    isActive: false,
    timeLeft: 0
  },
  {
    roundNumber: 7,
    title: "终章审判 FINAL JUDGEMENT",
    subtitle1: "你的YES or NO决定今夜王座归属\nYour YES or NO Decides Tonight's Throne！",
    question: "你是否要为乐队投上一票？\nDo you want to vote for the band?",
    options: ["Yes", "No"],
    note: "",
    isActive: false,
    timeLeft: 0
  },
  {
    roundNumber: 8,
    title: "终章审判 FINAL JUDGEMENT",
    subtitle1: "你的YES or NO决定今夜王座归属\nYour YES or NO Decides Tonight's Throne！",
    question: "你是否要为乐队投上一票？\nDo you want to vote for the band?",
    options: ["Yes", "No"],
    note: "",
    isActive: false,
    timeLeft: 0
  }
];

// Function to initialize database with default rounds
async function initializeDefaultRounds() {
  try {
    // Delete all existing rounds first
    await prisma.round.deleteMany({});
    
    // Create new rounds from defaultRounds array
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
    
    console.log('Database initialized with default rounds');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// GET - Fetch all rounds
export async function GET() {
  try {
    const rounds = await prisma.round.findMany({
      orderBy: {
        roundNumber: 'asc'
      }
    });
    
    // If no rounds exist, initialize with default rounds
    if (rounds.length === 0) {
      await initializeDefaultRounds();
      // Fetch the newly created rounds
      const initializedRounds = await prisma.round.findMany({
        orderBy: {
          roundNumber: 'asc'
        }
      });
      
      // Parse options string to array
      const roundsWithParsedOptions = initializedRounds.map(round => ({
        ...round,
        options: round.options ? JSON.parse(round.options) : ["", ""]
      }));
      
      return NextResponse.json(roundsWithParsedOptions);
    }
    
    // Parse options string to array for existing rounds
    const roundsWithParsedOptions = rounds.map(round => ({
      ...round,
      options: round.options ? JSON.parse(round.options) : ["", ""]
    }));
    
    return NextResponse.json(roundsWithParsedOptions);
  } catch (error) {
    console.error('Error fetching rounds:', error);
    return NextResponse.json({ error: 'Failed to fetch rounds' }, { status: 500 });
  }
}

// POST - Create or update a round
export async function POST(request: Request) {
  try {
    const { roundNumber, title, subtitle1, question, options, note, isActive, timeLeft } = await request.json();
    
    // Convert options array to string for storage
    const optionsString = JSON.stringify(options);
    
    // Check if round exists
    const existingRound = await prisma.round.findUnique({
      where: { roundNumber }
    });
    
    if (existingRound) {
      // Update existing round
      const updatedRound = await prisma.round.update({
        where: { roundNumber },
        data: {
          title,
          subtitle1,
          question,
          options: optionsString,
          note,
          isActive,
          timeLeft
        }
      });
      
      return NextResponse.json({
        ...updatedRound,
        options: options // Return the parsed options
      });
    } else {
      // Create new round
      const newRound = await prisma.round.create({
        data: {
          roundNumber,
          title,
          subtitle1,
          question,
          options: optionsString,
          note,
          isActive,
          timeLeft
        }
      });
      
      return NextResponse.json({
        ...newRound,
        options: options // Return the parsed options
      });
    }
  } catch (error) {
    console.error('Error updating round:', error);
    return NextResponse.json({ error: 'Failed to update round' }, { status: 500 });
  }
}

// PATCH - Update round status (active/inactive)
export async function PATCH(request: Request) {
  try {
    const { roundNumber, isActive, timeLeft } = await request.json();
    
    const updatedRound = await prisma.round.update({
      where: { roundNumber },
      data: { 
        isActive,
        timeLeft: timeLeft || 0
      }
    });
    
    // Parse options string to array
    const parsedOptions = updatedRound.options ? JSON.parse(updatedRound.options) : ["", ""];
    
    return NextResponse.json({
      ...updatedRound,
      options: parsedOptions
    });
  } catch (error) {
    console.error('Error updating round status:', error);
    return NextResponse.json({ error: 'Failed to update round status' }, { status: 500 });
  }
}

// PUT - Reinitialize database with default rounds
export async function PUT() {
  try {
    await initializeDefaultRounds();
    
    // Fetch the newly created rounds
    const rounds = await prisma.round.findMany({
      orderBy: {
        roundNumber: 'asc'
      }
    });
    
    // Parse options string to array
    const roundsWithParsedOptions = rounds.map(round => ({
      ...round,
      options: round.options ? JSON.parse(round.options) : ["", ""]
    }));
    
    return NextResponse.json(roundsWithParsedOptions);
  } catch (error) {
    console.error('Error reinitializing database:', error);
    return NextResponse.json({ error: 'Failed to reinitialize database' }, { status: 500 });
  }
} 