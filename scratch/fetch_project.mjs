import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  projects: [{
    projectId: String,
    appName: String,
    description: String,
    createdAt: Date
  }]
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function getProjectDetails(projectId) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne({ "projects.projectId": projectId });
    if (!user) {
      console.log("NOT_FOUND");
      return;
    }
    const project = user.projects.find(p => p.projectId === projectId);
    console.log(JSON.stringify(project));
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.connection.close();
  }
}

getProjectDetails("1778610330791");
