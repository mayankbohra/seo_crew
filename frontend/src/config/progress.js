export const progressSteps = [
    {
        title: "Extracting user data...",
        description: "Gathering information about your institution",
        icon: "📊",
        duration: 10000
    },
    {
        title: "Finding competitors...",
        description: "Identifying top competitors in your space",
        icon: "🔍",
        duration: 15000
    },
    {
        title: "Analyzing competitor keywords...",
        description: "Discovering high-value keyword opportunities",
        icon: "📈",
        duration: 30000
    },
    {
        title: "Generating blog outlines...",
        description: "Creating strategic content plans",
        icon: "✍️",
        duration: 40000
    }
];

// Calculate accumulated timings for each step
export const stepTimings = progressSteps.reduce((acc, step, index) => {
    const previousDuration = index === 0 ? 0 : acc[index - 1].time;
    acc[index] = {
        step: index,
        time: previousDuration + (index === 0 ? 0 : 500) // Add 500ms gap between steps
    };
    return acc;
}, []);

// Total duration of all steps
export const totalDuration = progressSteps.reduce((sum, step) => sum + step.duration, 0);
