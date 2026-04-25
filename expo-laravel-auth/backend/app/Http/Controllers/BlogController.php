<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class BlogController extends Controller
{
    public function fetchAllBlog(Request $request)
    {
        $blogs = Blog::with('user')->latest()->get();
        return response()->json($blogs);

    }

    public function createBlog(Request $request)
    {
        $user_id = $request->user()->id;

        $validated = $request->validate([
            'title'        => 'required|string|max:255',
            'description' => 'required|string',
            'image'       => 'required|image|max:2048',
        ]);

        $path = $request->file('image')->store('blogs', 'public');

        Blog::create([
            'title' => $request->title,
            'description' => $request->description,
            'image' => $path,
            'user_id' => auth()->id(),
        ]);

         return response()->json([
            'message' => 'Blog created successfully'
        ]);
    }

}
