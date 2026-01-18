import { supabase } from "@/lib/supabase";

export async function getCurrentUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user.id;
}

export async function ensureUserExists(userId: string): Promise<void> {
  try {
    // Check if user exists in users table
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id, name, handle, avatar_url")
      .eq("id", userId)
      .single();

    // Get user from Auth to get their metadata
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("[ensureUserExists] Could not fetch auth user:", authError);
      throw authError ?? new Error("Could not fetch auth user");
    }

    // Extract user info from auth metadata
    const name =
      user.user_metadata?.name || user.email?.split("@")[0] || "Traveler";
    const handle = `@${user.user_metadata?.handle || user.email?.split("@")[0] || "nomad"}`;
    const avatarUrl = user.user_metadata?.avatar_url || null;

    if (existingUser) {
      // User exists but might be missing name/handle - update if needed
      if (!existingUser.name || !existingUser.handle) {
        console.log("[ensureUserExists] Updating user with missing data...");
        const { error: updateError } = await supabase
          .from("users")
          .update({
            name: existingUser.name || name,
            handle: existingUser.handle || handle,
            avatar_url: existingUser.avatar_url || avatarUrl,
          })
          .eq("id", userId);

        if (updateError) {
          console.error(
            "[ensureUserExists] Failed to update user record:",
            updateError,
          );
          throw updateError;
        }
        console.log("[ensureUserExists] User record updated successfully");
      }
      return;
    }

    // User doesn't exist, create them
    const { error: insertError } = await supabase.from("users").insert({
      id: userId,
      name,
      handle,
      avatar_url: avatarUrl,
    });

    if (insertError) {
      console.error(
        "[ensureUserExists] Failed to create user record:",
        insertError,
      );
      throw insertError;
    }

    console.log(
      "[ensureUserExists] User record created successfully with name:",
      name,
    );
  } catch (error) {
    console.error("[ensureUserExists] Error:", error);
    throw error;
  }
}
