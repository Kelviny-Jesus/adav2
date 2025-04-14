import React from 'react';

interface SubscriptionPlansPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionPlansPopup: React.FC<SubscriptionPlansPopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0d1117] rounded-lg p-8 w-full max-w-5xl relative overflow-auto max-h-[90vh]">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-300 bg-transparent border-0 outline-none p-0"
        >
          <div className="i-ph:x text-xl"></div>
        </button>
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Acabou as mensagens?</h2>
          <p className="text-xl text-gray-300">
            Volte mês que vem ou assine um dos nossos planos para ter mais mensagens!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Starter Plan */}
          <div className="bg-[#0a0a0c] rounded-lg p-6 flex flex-col h-full">
            <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
            <p className="text-gray-400 mb-6">Ideal para uso pessoal</p>
            
            <div className="text-4xl font-bold text-white mb-6">
              R$149,99<span className="text-lg font-normal text-gray-400">/mês</span>
            </div>
            
            <a 
              href="https://buy.stripe.com/8wMdSa5kfaH83GU6ou"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-[#1a2b4c] hover:bg-[#1f3461] text-white py-3 rounded-md mb-8 font-medium text-center"
            >
              Assinar Agora
            </a>
            
            <div className="space-y-4 mt-auto">
              <div className="flex items-start">
                <div className="text-blue-500 mr-3 mt-1">
                  <div className="i-ph:check-circle-fill text-lg"></div>
                </div>
                <span className="text-white">100 mensagens por mês</span>
              </div>
              
              <div className="flex items-start">
                <div className="text-blue-500 mr-3 mt-1">
                  <div className="i-ph:check-circle-fill text-lg"></div>
                </div>
                <span className="text-white">4 exportações de chat</span>
              </div>
              
              <div className="flex items-start">
                <div className="text-blue-500 mr-3 mt-1">
                  <div className="i-ph:check-circle-fill text-lg"></div>
                </div>
                <span className="text-white">Acesso a todos os modelos</span>
              </div>
              
              <div className="flex items-start">
                <div className="text-blue-500 mr-3 mt-1">
                  <div className="i-ph:check-circle-fill text-lg"></div>
                </div>
                <span className="text-white">Suporte por email</span>
              </div>
            </div>
          </div>
          
          {/* Pro Plan */}
          <div className="bg-[#0a0a0c] rounded-lg p-6 flex flex-col h-full relative overflow-hidden">
            {/* Popular badge */}
            <div className="absolute top-0 right-0">
              <div className="bg-blue-600 text-white px-4 py-1 font-medium">
                Popular
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
            <p className="text-gray-400 mb-6">Para profissionais e equipes</p>
            
            <div className="text-4xl font-bold text-white mb-6">
              R$349,99<span className="text-lg font-normal text-gray-400">/mês</span>
            </div>
            
            <a 
              href="https://buy.stripe.com/3cs6pIh2XbLcfpCbIP"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md mb-8 font-medium text-center"
            >
              Assinar Agora
            </a>
            
            <div className="space-y-4 mt-auto">
              <div className="flex items-start">
                <div className="text-blue-500 mr-3 mt-1">
                  <div className="i-ph:check-circle-fill text-lg"></div>
                </div>
                <span className="text-white">300 mensagens por mês</span>
              </div>
              
              <div className="flex items-start">
                <div className="text-blue-500 mr-3 mt-1">
                  <div className="i-ph:check-circle-fill text-lg"></div>
                </div>
                <span className="text-white">20 exportações de chat</span>
              </div>
              
              <div className="flex items-start">
                <div className="text-blue-500 mr-3 mt-1">
                  <div className="i-ph:check-circle-fill text-lg"></div>
                </div>
                <span className="text-white">Acesso prioritário a novos recursos</span>
              </div>
              
              <div className="flex items-start">
                <div className="text-blue-500 mr-3 mt-1">
                  <div className="i-ph:check-circle-fill text-lg"></div>
                </div>
                <span className="text-white">Acesso a todos os modelos</span>
              </div>
              
              <div className="flex items-start">
                <div className="text-blue-500 mr-3 mt-1">
                  <div className="i-ph:check-circle-fill text-lg"></div>
                </div>
                <span className="text-white">Suporte prioritário</span>
              </div>
              
              <div className="flex items-start">
                <div className="text-blue-500 mr-3 mt-1">
                  <div className="i-ph:check-circle-fill text-lg"></div>
                </div>
                <span className="text-white">Recursos avançados de personalização</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlansPopup;
