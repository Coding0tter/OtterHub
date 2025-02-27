import type { FitnessUser } from "fitness-tracker-backend/types/user";
import { Button, Card, Header, Input, Label, useToast } from "components";
import { createResource, createSignal } from "solid-js";
import DatePicker, { type PickerValue } from "@rnwonder/solid-date-picker";
import "@rnwonder/solid-date-picker/dist/style.css";
import dayjs from "dayjs";
import { authApiClient, fitnessApiClient } from "../App";

export const Profile = () => {
  const { addToast } = useToast();
  const [weight, setWeight] = createSignal<number>(0);
  const [name, setName] = createSignal<string>("");
  const [height, setHeight] = createSignal<number>(0);
  const [dateOfBirth, setDateOfBirth] = createSignal<PickerValue>({
    value: {
      selected: "1996-12-31T23:00:00.000Z",
    },
    label: "",
  });

  const [user] = createResource(
    async (): Promise<FitnessUser & { image: string }> => {
      const result = await fitnessApiClient.get("/user");
      const userData = result.data;

      setWeight(userData.weight);
      setHeight(userData.height);
      setName(userData.name);
      if (userData.dateOfBirth)
        setDateOfBirth({
          value: { selected: userData.dateOfBirth.toString() },
          label: dayjs(userData.dateOfBirth).format("DD.MM.YYYY"),
        } as PickerValue);

      const imageResponse = await authApiClient.get(
        `/profile-picture?url=${result.data.picture}`,
        { responseType: "blob" },
      );
      const imageUrl = URL.createObjectURL(imageResponse.data);
      return { ...userData, image: imageUrl };
    },
  );

  const handleSave = async () => {
    try {
      await fitnessApiClient.put("/user", {
        user: {
          email: user()?.email,
          weight: weight(),
          height: height(),
          name: name(),
          dateOfBirth: dateOfBirth().value.selected,
        },
      });

      addToast({ message: "Profile updated successfully" });
    } catch (err) {
      addToast({ type: "error", message: "Error updating profile" });
      console.error(err);
    }
  };

  return (
    <main class="flex-1 container py-4 space-y-4 mb-16">
      <Header title={"Profile"} />
      <div class="flex flex-col items-center justify-center py-4">
        <span class="overflow-hidden ">
          {user.loading ? (
            <i class="fa-solid fa-spinner text-primary animate-spin"></i>
          ) : user.error ? (
            <span class="text-xs text-red-500">Failed to load user image</span>
          ) : (
            <img
              src={user()?.image}
              class="rounded-full h-24 w-24"
              alt="Profile"
            />
          )}
        </span>
      </div>

      <Card
        title="Personal Information"
        subtitle="Update your personal details"
      >
        <div class="space-y-2">
          <Input
            label="Name"
            placeholder="John Locke"
            value={name()}
            onInput={setName}
          />
        </div>

        <div class="space-y-2">
          <Label>Date of birth</Label>
          <DatePicker
            inputClass="flex h-10 w-full input !px-2"
            shouldCloseOnSelect
            placeholder="Date of birth"
            formatInputLabel="dd.mm.yyyy"
            value={dateOfBirth}
            setValue={setDateOfBirth}
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Input
              label="Height (cm)"
              type="number"
              placeholder="Height in cm"
              value={height()}
              onInput={(e) => setHeight(+e.currentTarget.value)}
            />
          </div>
          <div class="space-y-2">
            <Input
              label="Weight (kg)"
              type="number"
              placeholder="Weight in kg"
              value={weight()}
              onInput={(e) => setWeight(+e.currentTarget.value)}
            />
          </div>
        </div>
        <div class="divider" />
        <Button onClick={handleSave} type="info" label="Update profile" />
      </Card>
    </main>
  );
};
