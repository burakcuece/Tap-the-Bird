import React, { useState } from 'react';
import { Github, Twitter, X } from 'lucide-react';

export const Footer: React.FC = () => {
    const [showImpressum, setShowImpressum] = useState(false);

    return (
        <footer className="w-full max-w-2xl mx-auto px-4 py-8">
            <div className="text-center space-y-6">
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">Tap the Bird</h2>
                    <p className="text-blue-100">Ein einfaches, aber süchtiges Spiel für zwischendurch</p>
                </div>

                <div className="flex justify-center space-x-6">
                    <a
                        href="https://github.com/burakcuece/Tap-the-Bird"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-blue-200 transition-colors"
                    >
                        <Github size={24} />
                    </a>
                    <a
                        href="https://twitter.com/yourusername"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-blue-200 transition-colors"
                    >
                        <Twitter size={24} />
                    </a>
                </div>

                <div className="text-sm text-blue-100">
                    <p>© {new Date().getFullYear()} Tap the Bird. Alle Rechte vorbehalten.</p>
                    <p className="mt-1">
                        Entwickelt mit ♥ in Deutschland
                    </p>
                    <button
                        onClick={() => setShowImpressum(true)}
                        className="mt-2 text-blue-100 hover:text-white underline"
                    >
                        Impressum
                    </button>
                </div>

                {showImpressum && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full m-4 relative">
                            <button
                                onClick={() => setShowImpressum(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                            <h2 className="text-2xl font-bold mb-4">Impressum</h2>
                            <div className="space-y-4 text-gray-700">
                                <section>
                                    <h3 className="font-semibold mb-2">Angaben gemäß § 5 TMG</h3>
                                    <p>Burak Cüce</p>
                                    <p>Professor-Knipping-Str. 28 </p>
                                    <p>45661 Recklinghausen</p>
                                    <p>Deutschland</p>
                                </section>

                                <section>
                                    <h3 className="font-semibold mb-2">Kontakt</h3>
                                    <p>Telefon: +49 (0) 163 6753600</p>
                                    <p>E-Mail: info@tapthebird.com</p>
                                </section>

                                <section>
                                    <h3 className="font-semibold mb-2">Verantwortlich für den Inhalt</h3>
                                    <p>Burak Cüce</p>
                                    <p>Professor-Knipping-Str. 28 </p>
                                    <p>45661 Recklinghausen</p>
                                </section>

                                <section>
                                    <h3 className="font-semibold mb-2">Streitschlichtung</h3>
                                    <p>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr/</p>
                                    <p className="mt-2">Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
                                </section>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </footer>
    );
};