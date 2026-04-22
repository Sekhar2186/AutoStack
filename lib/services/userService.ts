import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "lib/data/user.json");

export function getUsers() {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
}

export function saveUsers(users: any) {
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
}

export function findUserByEmail(email: string) {
    const users = getUsers();
    return users.find((u: any) => u.email === email);
}

export function createUser(user: any) {
    const users = getUsers();
    users.push(user);
    saveUsers(users);
}
export function resetDailyCredits(user: any) {
    const now = new Date();
    const last = new Date(user.lastReset);

    const isNewDay =
        now.getDate() !== last.getDate() ||
        now.getMonth() !== last.getMonth() ||
        now.getFullYear() !== last.getFullYear();

    if (isNewDay) {
        if (user.plan = 'pro_plus') {
            user.credits = Infinity;
        }
        else if (user.plan = "pro") {
            user.credits = 500;
        }
        else {
            user.credits = 20;
        }

        user.lastReset = now.toISOString();
    }

    return user;
}
export function updateUserPlan(user: any) {
    const now = new Date();

    // Trial expiry
    if (user.trialEndsAt && now > new Date(user.trialEndsAt)) {
        user.plan = "free";
        user.trialEndsAt = null;
    }

    // Paid plan expiry
    if (user.planExpiresAt && now > new Date(user.planExpiresAt)) {
        user.plan = "free";
        user.planExpiresAt = null;
    }

    return user;
}