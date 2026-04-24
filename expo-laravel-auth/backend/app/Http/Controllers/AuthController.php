<?php

namespace App\Http\Controllers;

use App\Models\User;
use Hash;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function user(Request $request)
    {
        return $request->user();
    }

    public function register(Request $request)
    {
    $validated = $request->validate([
        'name'                  => 'required|string|max:255',
        'email'                 => 'required|email|unique:users',
        'password'              => 'required|min:8|confirmed',
        'image'                 => 'nullable|image|max:2048',
    ]);

    $validated['password'] = bcrypt($validated['password']);

    $validated['image'] = $request->hasFile('image')
        ? $request->file('image')->store('avatars', 'public')
        : null;

    // if ($request->hasFile('image')) {
    //     $validated['image'] = $request->file('image')->store('avatars', 'public');
    // }

    User::create($validated);

    return response()->json(['message' => 'Registered successfully'], 201);
}

    public function login(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required']
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'The provided credentials are incorrect.'], 422);
        }

        $token = $user->createToken('token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'message' => 'Login successfully!'
        ], 200);
    }

    public function logout(Request $request)
    {
        $user = $request->user();

        $user->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout successfully!'
        ], 200);
    }
}
