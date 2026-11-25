import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api";
import { ArrowLeft, Eye, Calendar } from "lucide-react";

export default function AuthorArticle() {
    const { username, slug } = useParams();

    const [loading, setLoading] = useState(true);
    const [article, setArticle] = useState(null);

    useEffect(() => {
        const loadArticle = async () => {
            try {
                const response = await api.get(
                    `/authors/${username}/articles/${slug}`
                );

                setArticle(response.data.article);
            } catch (error) {
                setArticle(null);
            } finally {
                setLoading(false);
            }
        };

        loadArticle();
    }, [username, slug]);

    if (loading) {
        return (
            <div className="p-10 text-center">
                Loading article...
            </div>
        );
    }

    if (!article) {
        return (
            <div className="p-10 text-center">
                <h2 className="text-xl font-bold">
                    Article not found
                </h2>
            </div>
        );
    }

    const author = article.author;

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <article className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm overflow-hidden">

                {article.cover_image && (
                    <img
                        src={`http://localhost:8000/storage/${article.cover_image}`}
                        alt={article.title}
                        className="w-full max-h-[450px] object-cover"
                    />
                )}

                <div className="p-6 md:p-10">

                    <Link
                        to={`/authors/${username}`}
                        className="inline-flex items-center gap-2 text-green-600 text-sm mb-6"
                    >
                        <ArrowLeft size={16} />
                        Back to Author
                    </Link>

                    {article.category && (
                        <p className="text-green-600 text-sm font-semibold mb-3">
                            {article.category}
                        </p>
                    )}

                    <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                        {article.title}
                    </h1>

                    {article.excerpt && (
                        <p className="text-gray-500 text-lg mt-4">
                            {article.excerpt}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 border-y py-4 my-6">
                        <span>
                            By {author?.display_name}
                        </span>

                        <span className="flex items-center gap-1">
                            <Calendar size={15} />
                            {article.published_at
                                ? new Date(article.published_at).toLocaleDateString()
                                : ""}
                        </span>

                        <span className="flex items-center gap-1">
                            <Eye size={15} />
                            {article.views} views
                        </span>
                    </div>

                    <div className="whitespace-pre-wrap break-words leading-8 text-gray-800">
                        {article.content}
                    </div>

                    <div className="border-t mt-10 pt-6">
                        <p className="text-gray-500 text-sm">
                            Written by
                        </p>

                        <Link
                            to={`/authors/${username}`}
                            className="font-bold text-green-700"
                        >
                            {author?.display_name}
                        </Link>
                    </div>
                </div>
            </article>
        </div>
    );
}