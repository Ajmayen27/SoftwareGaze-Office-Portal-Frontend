

// Mock data for development when backend is not available
export const mockEmployees = [
    {
        id: 1,
        username: "admin_user",
        email: "admin@example.com",
        designation: "System Administrator",
        role: "ADMIN"
    },
    {
        id: 2,
        username: "john_doe",
        email: "john@example.com",
        designation: "Software Developer",
        role: "USER"
    },
    {
        id: 3,
        username: "jane_smith",
        email: "jane@example.com",
        designation: "Project Manager",
        role: "USER"
    }
];

export const mockExpenses = [
    {
        id: 1,
        billType: "Electric Bill",
        amount: 150.75,
        comment: "Monthly electricity",
        date: "2025-01-19",
        tag: 'paid'
    },
    {
        id: 2,
        billType: "Office Supplies",
        amount: 85.00,
        comment: "New keyboards and mice",
        date: "2025-01-18",
        tag: 'unpaid'
    },
    {
        id: 3,
        billType: "Internet Bill",
        amount: 120.00,
        comment: "Monthly fiber connection",
        date: "2025-01-17",
        tag: 'paid'
    }
];

export const mockAnalytics = {
    monthlyTotal: 355.75,
    yearlyTotal: 4250.50,
    totalExpenses: 3
};
