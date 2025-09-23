// import { HydrateClient } from "mydive/trpc/server";
// import { redirect } from "next/navigation";
// import { checkRole } from "../../utils/roles";
// import { SearchUsers } from "./SearchUsers";
// import { clerkClient } from "@clerk/nextjs/server";
// import { removeRole, setRole } from "./_actions";

// function RoleButton({ userId, role, action, children }) {
//   const bgColor =
//     role === "admin"
//       ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
//       : "bg-green-100 text-green-700 hover:bg-green-200";

//   return (
//     <form action={action}>
//       <input type="hidden" value={userId} name="id" />
//       <input type="hidden" value={role} name="role" />
//       <button
//         type="submit"
//         className={`rounded px-3 py-1 text-sm transition-colors ${bgColor}`}
//       >
//         {children}
//       </button>
//     </form>
//   );
// }

// export default async function AdminDashboard(params: {
//   searchParams: Promise<{ search?: string }>;
// }) {
//   const isAdmin = await checkRole("admin");
//   if (!isAdmin) {
//     redirect("/");
//   }
//   const query = (await params.searchParams).search;
//   const client = await clerkClient();
//   const users = query ? (await client.users.getUserList({ query })).data : [];
//   console.log("users", users);
//   return (
//     <HydrateClient>
//       <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden text-white">
//         {/* Background Video */}
//         <video
//           autoPlay
//           muted
//           loop
//           playsInline
//           className="absolute inset-0 z-0 h-full w-full object-cover"
//         >
//           <source src="/videos/skydiving-background.mp4" type="video/mp4" />

//           {/* Fallback gradient background */}
//         </video>
//         {/* Dark overlay for better text readability */}
//         <div className="absolute inset-0 bg-black/40"></div>

//         {/* Content */}
//         <div className="z-10 bg-white p-4 text-black">
//           <SearchUsers />
//           <div className="mt-4 space-y-4">
//             {users.map((user) => {
//               const primaryEmail = user.emailAddresses.find(
//                 (email) => email.id === user.primaryEmailAddressId,
//               )?.emailAddress;

//               const currentRole = user.publicMetadata.role as string;

//               return (
//                 <div
//                   key={user.id}
//                   className="rounded-lg border border-gray-200 p-4 shadow-sm"
//                 >
//                   <div className="mb-3">
//                     <h3 className="text-lg font-semibold">
//                       {user.firstName} {user.lastName}
//                     </h3>
//                     <p className="text-sm text-gray-600">{primaryEmail}</p>
//                     <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
//                       {currentRole || "User"}
//                     </span>
//                   </div>

//                   <div className="flex flex-wrap gap-2">
//                     <RoleButton userId={user.id} role="admin" action={setRole}>
//                       Make Admin
//                     </RoleButton>

//                     <RoleButton
//                       userId={user.id}
//                       role="moderator"
//                       action={setRole}
//                     >
//                       Make Moderator
//                     </RoleButton>

//                     <form action={removeRole}>
//                       <input type="hidden" value={user.id} name="id" />
//                       <button
//                         type="submit"
//                         className="rounded bg-red-100 px-3 py-1 text-sm text-red-700 transition-colors hover:bg-red-200"
//                       >
//                         Remove Role
//                       </button>
//                     </form>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </main>
//     </HydrateClient>
//   );
// }
