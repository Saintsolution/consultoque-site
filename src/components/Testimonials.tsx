import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Maria Silva',
    role: 'Mãe de 2 filhos',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    text: 'Maravilhoso! Meu filho teve febre alta à noite e consegui falar com um pediatra em minutos. Recebi a receita na hora e no dia seguinte ele já estava melhor.',
    rating: 5,
  },
  {
    name: 'João Santos',
    role: 'Empresário',
    image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
    text: 'Economizo muito com os descontos do clube. Só na farmácia já economizei mais de R$ 300 em um mês. Vale muito a pena!',
    rating: 5,
  },
  {
    name: 'Ana Oliveira',
    role: 'Professora',
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    text: 'Não preciso mais faltar no trabalho para ir ao médico. Faço as consultas no intervalo de casa mesmo. Praticidade total!',
    rating: 5,
  },
  {
    name: 'Carlos Mendes',
    role: 'Aposentado',
    image: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=400',
    text: 'Para mim que sou idoso, é perfeito. Não preciso enfrentar fila e tenho médico sempre que preciso. Recomendo muito!',
    rating: 5,
  },
  {
    name: 'Juliana Costa',
    role: 'Estudante',
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
    text: 'Por R$ 29,90 tenho atendimento médico e ainda desconto em academia e restaurantes. Melhor investimento que já fiz!',
    rating: 5,
  },
  {
    name: 'Roberto Alves',
    role: 'Motorista',
    image: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=400',
    text: 'Trabalho de madrugada e sempre tive dificuldade para consultas. Agora consigo atendimento a qualquer hora. Excelente!',
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            O que nossos clientes dizem
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Mais de 10 mil pessoas já confiam no CONSULTOQUE para cuidar da sua saúde
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 relative"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-blue-200" />

              <div className="flex items-center gap-4 mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>

              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <p className="text-gray-700 italic">"{testimonial.text}"</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <p className="text-4xl font-bold text-blue-600 mb-2">10mil+</p>
            <p className="text-gray-600">Clientes Ativos</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <p className="text-4xl font-bold text-blue-600 mb-2">4.9/5</p>
            <p className="text-gray-600">Avaliação Média</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <p className="text-4xl font-bold text-blue-600 mb-2">98%</p>
            <p className="text-gray-600">Recomendam</p>
          </div>
        </div>
      </div>
    </section>
  );
}
