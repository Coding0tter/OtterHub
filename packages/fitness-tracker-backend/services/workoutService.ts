import { ExerciseModel } from "../models/exercise.model";
import { UserModel } from "../models/user.model";
import { ActualWorkoutModel, WorkoutModel } from "../models/workout.model";
import type { FitnessUser } from "../types/user";
import type { ActualWorkout, Workout } from "../types/workout";

export const upsertUser = async (user: FitnessUser) => {
  const existingUser = await UserModel.findOne({ userId: user.id });

  if (!existingUser) {
    user.userId = user.id!;
    return await UserModel.create(user);
  }

  return await UserModel.findOneAndUpdate({ userId: user.id }, user, {
    new: true,
  }).lean();
};

export const getUser = async (userId: string) => {
  return await UserModel.findOne({ userId })
    .populate("plannedWorkouts")
    .populate("actualWorkouts")
    .lean()
    .exec();
};

export const upsertWorkout = async (userId: string, workout: Workout) => {
  try {
    const existingUser = await UserModel.findOne({ userId });
    if (!existingUser) {
      return null;
    }

    if (workout.exercises && workout.exercises.length > 0) {
      const exerciseIds = await Promise.all(
        workout.exercises.map(async (exercise) => {
          if (exercise._id) {
            const updatedExercise = await ExerciseModel.findByIdAndUpdate(
              exercise._id,
              exercise,
              { new: true },
            );
            return updatedExercise!._id;
          } else {
            const newExercise = await ExerciseModel.create(exercise);
            return newExercise._id;
          }
        }),
      );

      (workout as any).exercises = exerciseIds;
    }

    let workoutDoc;
    if (workout._id) {
      workoutDoc = await WorkoutModel.findByIdAndUpdate(workout._id, workout, {
        new: true,
      });
    } else {
      workoutDoc = await WorkoutModel.create(workout);
    }

    if (
      !existingUser.plannedWorkouts.some((wId) => wId.equals(workoutDoc!._id))
    ) {
      existingUser.plannedWorkouts.push(workoutDoc!._id);
      await existingUser.save();
    }

    return workoutDoc;
  } catch (error) {
    console.error("Error in upsertWorkout:", error);
    throw error;
  }
};

export const getWorkoutById = async (id: string) => {
  return await WorkoutModel.findById(id).populate("exercises").lean();
};

export const deleteWorkout = async (id: string) => {
  const workout = await WorkoutModel.findByIdAndDelete(id);
  await ExerciseModel.deleteMany({ _id: { $in: workout?.exercises } });
};

export const saveActualWorkout = async (
  userId: string,
  exercises: ActualWorkout[],
) => {
  try {
    const existingUser = await UserModel.findOne({ userId });
    if (!existingUser) {
      return;
    }
    const now = Date.now();

    if (exercises.length > 0) {
      const exerciseIds = await Promise.all(
        exercises.map(async (exercise: any) => {
          exercise.date = now;
          const newExercise = await ActualWorkoutModel.create(exercise);
          return newExercise._id;
        }),
      );

      existingUser.actualWorkouts.push(...exerciseIds);
      await existingUser.save();
    }
  } catch (error) {
    console.error("Error in saveActualWorkout:", error);
    throw error;
  }
};

export const getGroupedWorkouts = async (userId: string) => {
  const existingUser = await UserModel.findOne({ userId })
    .populate("actualWorkouts")
    .lean();

  if (!existingUser) return;

  const workouts = existingUser.actualWorkouts;
  const groupedWorkouts = workouts.reduce(
    (acc: Record<string, any[]>, workout: any) => {
      const dateKey = new Date(workout.date).toISOString().split("T")[0];
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(workout);
      return acc;
    },
    {},
  );

  return groupedWorkouts;
};

export const getProgress = async (userId: string) => {
  const user = await UserModel.findOne({ userId });
  if (!user) return;

  const workoutIds = user.actualWorkouts;

  const overallProgress = await ActualWorkoutModel.aggregate([
    { $match: { _id: { $in: workoutIds } } },
    { $unwind: "$sets" },
    {
      $group: {
        _id: "$date",
        avgWeight: { $avg: "$sets.weight" },
        maxWeight: { $max: "$sets.weight" },
        totalReps: { $sum: "$sets.repetitions" },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const progressByExercise = await ActualWorkoutModel.aggregate([
    { $match: { _id: { $in: workoutIds } } },
    { $unwind: "$sets" },
    {
      $group: {
        _id: { exercise: "$name", date: "$date" },
        avgWeight: { $avg: "$sets.weight" },
        maxWeight: { $max: "$sets.weight" },
        totalReps: { $sum: "$sets.repetitions" },
      },
    },
    { $sort: { "_id.date": 1 } },
  ]);

  return { overallProgress, progressByExercise };
};
