export const progressSteps = [
    {
        id: 1,
        name: 'Analysis',
        description: 'Analyzing competitor keywords and rankings'
    },
    {
        id: 2,
        name: 'Keyword Selection',
        description: 'Select target keywords for content generation'
    },
    {
        id: 3,
        name: 'Content Generation',
        description: 'Generating ad copies and blog outlines'
    }
];

export const stepTimings = {
    1: 120, // Analysis - 2 minutes
    2: 30,  // Keyword Selection - 30 seconds
    3: 180  // Content Generation - 3 minutes
};

export const totalDuration = Object.values(stepTimings).reduce((a, b) => a + b, 0);
