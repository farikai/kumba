import { cronJobs } from "convex/server"
import { internal } from "./_generated/api"

const crons = cronJobs()

// Check every hour for scheduled payments that are due
crons.interval("execute scheduled payments", { hours: 1 }, internal.scheduled.executePayments)

export default crons
