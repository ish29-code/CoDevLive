// src/data/problems.js

export const problems = {
    "1": {
        id: "1",
        title: "Two Sum",
        difficulty: "Easy",
        pattern: "Arrays",
        description: `
Given an array of integers nums and an integer target,
return indices of the two numbers such that they add up to target.
    `,
        examples: [
            {
                input: "nums = [2,7,11,15], target = 9",
                output: "[0,1]",
            },
        ],
        hints: [
            "Use a hash map to store visited numbers",
            "Check if target - current exists",
            "Solve in O(n)",
        ],
        starterCode: `function twoSum(nums, target) {\n\n}`,
    },

    "2": {
        id: "2",
        title: "Longest Subarray Sum K",
        difficulty: "Medium",
        pattern: "Sliding Window",
        description: `
Find the length of the longest subarray with sum equal to K.
    `,
        examples: [
            {
                input: "arr = [1,2,3,1,1,1,1], k = 3",
                output: "3",
            },
        ],
        hints: [
            "Use prefix sum",
            "Use hashmap to store first occurrence",
        ],
        starterCode: `function longestSubarray(arr, k) {\n\n}`,
    },
};
