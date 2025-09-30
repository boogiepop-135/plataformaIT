import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const TicketRating = ({ ticket, onRatingSubmitted }) => {
    const { auth } = useAuth();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const handleStarClick = (starValue) => {
        setRating(starValue);
    };

    const handleSubmitRating = async () => {
        if (rating === 0) {
            alert('Por favor selecciona una calificación');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/tickets/${ticket.id}/rate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.token}`
                },
                body: JSON.stringify({
                    rating,
                    comment: comment.trim()
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('¡Gracias por tu calificación!');
                setShowForm(false);
                if (onRatingSubmitted) {
                    onRatingSubmitted(data.ticket);
                }
            } else {
                alert(data.error || 'Error al enviar calificación');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Si el ticket ya tiene calificación, mostrar la calificación existente
    if (ticket.rating) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Calificación del servicio</h4>
                <div className="flex items-center mb-2">
                    {[1, 2, 3].map((star) => (
                        <svg
                            key={star}
                            className={`w-5 h-5 ${star <= ticket.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                        ({ticket.rating}/3 estrellas)
                    </span>
                </div>
                {ticket.rating_comment && (
                    <p className="text-sm text-gray-700 italic">
                        "{ticket.rating_comment}"
                    </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                    Calificado el {new Date(ticket.rated_at).toLocaleDateString()}
                </p>
            </div>
        );
    }

    // Si el ticket está resuelto y el usuario puede calificar
    if (ticket.status === 'resolved' && (auth.user.id === ticket.user_id || auth.user.role === 'admin')) {
        if (!showForm) {
            return (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <p className="text-blue-800 mb-3">
                        El ticket ha sido resuelto. ¿Te gustaría calificar el servicio?
                    </p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Calificar Servicio
                    </button>
                </div>
            );
        }

        return (
            <div className="bg-white border border-gray-200 rounded-lg p-4 mt-4">
                <h4 className="font-medium text-gray-900 mb-4">Califica el servicio recibido</h4>

                {/* Estrellas */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Calificación *
                    </label>
                    <div className="flex items-center space-x-1">
                        {[1, 2, 3].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => handleStarClick(star)}
                                className="focus:outline-none"
                            >
                                <svg
                                    className={`w-8 h-8 transition-colors ${star <= rating
                                            ? 'text-yellow-400 hover:text-yellow-500'
                                            : 'text-gray-300 hover:text-gray-400'
                                        }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </button>
                        ))}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        {rating === 1 && "Malo"}
                        {rating === 2 && "Regular"}
                        {rating === 3 && "Excelente"}
                    </div>
                </div>

                {/* Comentario */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comentarios (opcional)
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Comparte tu experiencia con el servicio recibido..."
                        maxLength={500}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                        {comment.length}/500 caracteres
                    </div>
                </div>

                {/* Botones */}
                <div className="flex space-x-3">
                    <button
                        onClick={handleSubmitRating}
                        disabled={isSubmitting || rating === 0}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSubmitting ? 'Enviando...' : 'Enviar Calificación'}
                    </button>
                    <button
                        onClick={() => setShowForm(false)}
                        disabled={isSubmitting}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 disabled:opacity-50 transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

export default TicketRating;