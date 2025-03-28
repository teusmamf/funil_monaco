import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { User, Mail, ArrowRight, Phone, Calendar, Users, DollarSign } from 'lucide-react';
import type { FunnelData, Rates, MarketRates } from './types';

// Import the background image (you can replace this with the actual path to your image)
import monacoCircuit from '../assets/logo.png'; // Adjust the path as needed

const marketRates: MarketRates = {
  leadsToAppointments: 5.1,
  appointmentsToAttendance: 22.4,
  attendanceToSales: 36.3,
  leadsToSales: 4.2
};

function App() {
  const [step, setStep] = useState(1);
  const [rates, setRates] = useState<Rates | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FunnelData>();

  const calculateRates = (data: FunnelData): Rates => {
    return {
      leadsToAppointments: (data.appointments / data.leads) * 100,
      appointmentsToAttendance: (data.attendance / data.appointments) * 100,
      attendanceToSales: (data.sales / data.attendance) * 100,
      leadsToSales: (data.sales / data.leads) * 100
    };
  };

  const onSubmit = async (data: FunnelData) => {
    setIsSubmitting(true);
    try {
      const calculatedRates = calculateRates(data);
      setRates(calculatedRates);

      const response = await axios.post(
        'https://server-62bnhce9q-teusmamfs-projects.vercel.app/api/submit-form',
        {
          ...data,
          rates: calculatedRates,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status !== 200) {
        throw new Error('Failed to submit form');
      }

      setStep(2);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Ocorreu um erro ao enviar os dados. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRateLabel = (key: keyof Rates): string => {
    switch (key) {
      case 'leadsToAppointments':
        return 'A taxa média do seu segmento de visitantes para Leads é';
      case 'appointmentsToAttendance':
        return 'A taxa média do seu segmento de Leads para oportunidades é';
      case 'attendanceToSales':
        return 'A taxa média do seu segmento de oportunidades para vendas é';
      case 'leadsToSales':
        return 'A taxa média do seu segmento de Leads para vendas é';
      default:
        return '';
    }
  };

  return (
    <div
      className="min-h-screen bg-black flex items-center justify-center p-4 md:p-8"
      style={{
        backgroundImage: `url(${monacoCircuit})`,
        backgroundSize: 'contain', // Ensures the image fits without stretching
        backgroundPosition: 'center', // Centers the image
        backgroundRepeat: 'no-repeat', // Prevents tiling
      }}
    >
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-6 md:p-8"
      >
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Análise de Funil Odontológico
        </h1>

        {step === 1 && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="flex items-center text-white mb-2">
                <User className="w-5 h-5 mr-2 text-white" />
                Nome Completo
              </label>
              <input
                {...register("name", { required: "Nome é obrigatório" })}
                className="w-full p-3 border border-white/30 bg-transparent text-white rounded-lg focus:ring-2 focus:ring-blue-500 placeholder-white/50"
                placeholder="Seu nome"
              />
              {errors.name && (
                <span className="text-red-400 text-sm">{errors.name.message}</span>
              )}
            </div>

            <div>
              <label className="flex items-center text-white mb-2">
                <Mail className="w-5 h-5 mr-2 text-white" />
                E-mail
              </label>
              <input
                {...register("email", { 
                  required: "E-mail é obrigatório",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "E-mail inválido"
                  }
                })}
                className="w-full p-3 border border-white/30 bg-transparent text-white rounded-lg focus:ring-2 focus:ring-blue-500 placeholder-white/50"
                placeholder="seu@email.com"
              />
              {errors.email && (
                <span className="text-red-400 text-sm">{errors.email.message}</span>
              )}
            </div>

            <div>
              <label className="flex items-center text-white mb-2">
                <Phone className="w-5 h-5 mr-2 text-white" />
                Telefone
              </label>
              <input
                {...register("phone", { 
                  required: "Telefone é obrigatório",
                  pattern: {
                    value: /^\+?[1-9]\d{1,14}$/,
                    message: "Telefone inválido (use apenas números, opcionalmente com código de país)"
                  }
                })}
                className="w-full p-3 border border-white/30 bg-transparent text-white rounded-lg focus:ring-2 focus:ring-blue-500 placeholder-white/50"
                placeholder="+5511999999999"
              />
              {errors.phone && (
                <span className="text-red-400 text-sm">{errors.phone.message}</span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center text-white mb-2">
                  <Phone className="w-5 h-5 mr-2 text-white" />
                  Leads Recebidos
                </label>
                <input
                  type="number"
                  {...register("leads", { required: true, min: 0 })}
                  className="w-full p-3 border border-white/30 bg-transparent text-white rounded-lg focus:ring-2 focus:ring-blue-500 placeholder-white/50"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="flex items-center text-white mb-2">
                  <Calendar className="w-5 h-5 mr-2 text-white" />
                  Agendamentos
                </label>
                <input
                  type="number"
                  {...register("appointments", { required: true, min: 0 })}
                  className="w-full p-3 border border-white/30 bg-transparent text-white rounded-lg focus:ring-2 focus:ring-blue-500 placeholder-white/50"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="flex items-center text-white mb-2">
                  <Users className="w-5 h-5 mr-2 text-white" />
                  Comparecimentos
                </label>
                <input
                  type="number"
                  {...register("attendance", { required: true, min: 0 })}
                  className="w-full p-3 border border-white/30 bg-transparent text-white rounded-lg focus:ring-2 focus:ring-blue-500 placeholder-white/50"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="flex items-center text-white mb-2">
                  <DollarSign className="w-5 h-5 mr-2 text-white" />
                  Vendas Realizadas
                </label>
                <input
                  type="number"
                  {...register("sales", { required: true, min: 0 })}
                  className="w-full p-3 border border-white/30 bg-transparent text-white rounded-lg focus:ring-2 focus:ring-blue-500 placeholder-white/50"
                  placeholder="0"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 disabled:opacity-70 hover:bg-blue-700 transition-colors"
              type="submit"
            >
              <span>{isSubmitting ? 'Enviando...' : 'Analisar Resultados'}</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </form>
        )}

        {step === 2 && rates && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2 text-white">Ticket médio</h3>
                <p className="text-2xl font-bold text-white">R$ 4.000,00</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2 text-white">Faturamento médio</h3>
                <p className="text-2xl font-bold text-blue-400">R$ 12.000,00</p>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(rates).map(([key, value]) => {
                const marketRate = marketRates[key as keyof MarketRates];
                const isAboveAverage = value >= marketRate;

                return (
                  <div key={key} className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-4xl font-bold">
                        <span className={isAboveAverage ? 'text-green-400' : 'text-red-400'}>
                          {value.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-4xl font-bold text-blue-400">
                        {marketRate}%
                      </div>
                    </div>
                    <p className="text-gray-300 mb-2">
                      {getRateLabel(key as keyof Rates)} {marketRate}%.
                    </p>
                    <p className={`text-lg font-medium ${isAboveAverage ? 'text-green-400' : 'text-red-400'}`}>
                      {isAboveAverage 
                        ? "Você está acima da média do segmento de Saúde e Estética. Ótimo trabalho!"
                        : "Você está abaixo da média do segmento de Saúde e Estética. Com certeza ainda tem espaço para melhorias!"}
                    </p>
                  </div>
                );
              })}
            </div>

            <motion.a
              href={`https://wa.me/SEUNUMERO?text=${encodeURIComponent(
                `Olá! Analisei meu funil e gostaria de melhorar meus resultados. Minhas taxas são:\n` +
                `Leads para Agendamentos: ${rates.leadsToAppointments.toFixed(1)}%\n` +
                `Agendamentos para Comparecimentos: ${rates.appointmentsToAttendance.toFixed(1)}%\n` +
                `Comparecimentos para Vendas: ${rates.attendanceToSales.toFixed(1)}%\n` +
                `Leads para Vendas: ${rates.leadsToSales.toFixed(1)}%`
              )}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="block w-full bg-green-600 text-white py-3 rounded-lg font-semibold text-center mt-6 hover:bg-green-700 transition-colors"
            >
              Quero ajuda para melhorar meu funil
            </motion.a>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default App;