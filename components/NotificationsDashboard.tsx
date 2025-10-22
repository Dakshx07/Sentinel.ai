import React, { useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import ToggleSwitch from './ToggleSwitch';
import { MailIcon, SlackIcon, ShieldIcon, HistoryIcon, CheckIcon, SpinnerIcon, InfoIcon } from './icons';

const mockNotifications = [
  { id: 1, type: 'vulnerability', icon: <ShieldIcon severity="Critical" className="w-5 h-5" />, text: 'New critical vulnerability found in sentinel-ai/website.', time: '5m ago' },
  { id: 2, type: 'commit', icon: <HistoryIcon className="w-5 h-5 text-medium-dark-text dark:text-medium-text" />, text: 'Commit `a4e3f2d` in sentinel-ai/api flagged for exposed secret.', time: '2h ago' },
  { id: 3, type: 'pr', icon: <CheckIcon className="w-5 h-5 text-green-500" />, text: 'PR #124 in sentinel-ai/website passed security checks.', time: '1d ago' },
  { id: 4, type: 'vulnerability', icon: <ShieldIcon severity="High" className="w-5 h-5" />, text: '2 new high-severity issues found in sentinel-ai/docs.', time: '2d ago' },
];

type BotStatus = 'live' | 'simulation' | 'disconnected';

const NotificationsDashboard: React.FC = () => {
  const { addToast } = useToast();
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [slackEnabled, setSlackEnabled] = useState(false);
  const [emailAddress, setEmailAddress] = useState('dev.sentinel@example.com');
  const [slackWebhook, setSlackWebhook] = useState('');
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [isTestingSlack, setIsTestingSlack] = useState(false);
  const [botStatus, setBotStatus] = useState<BotStatus>('disconnected');

  useEffect(() => {
    const fetchBotStatus = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/status');
            if (!response.ok) {
                throw new Error('Failed to connect to bot server.');
            }
            const data = await response.json();
            setBotStatus(data.emailService || 'simulation');
        } catch (error) {
            setBotStatus('disconnected');
            console.warn("Could not connect to the Sentinel Bot server. Running in disconnected mode.");
        }
    };
    fetchBotStatus();
  }, []);

  const handleSendTestEmail = async () => {
      setIsTestingEmail(true);

      if (!emailAddress || !emailAddress.includes('@')) {
          addToast('Please enter a valid email address.', 'error');
          setIsTestingEmail(false);
          return;
      }
      
      if (botStatus === 'disconnected') {
           await new Promise(resolve => setTimeout(resolve, 1000));
           addToast(`(Simulation) Test notification logged. No real email was sent.`, 'success');
           setIsTestingEmail(false);
           return;
      }

      try {
          const response = await fetch('http://localhost:3001/api/send-test-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: emailAddress }),
          });
          const data = await response.json();
          if (!response.ok) {
              throw new Error(data.error || 'Failed to send test email.');
          }
          addToast(data.message, 'success');
      } catch (error: any) {
          addToast(error.message, 'error');
      } finally {
          setIsTestingEmail(false);
      }
  };

  const handleSendTestSlack = () => {
    setIsTestingSlack(true);
    setTimeout(() => {
      if (!slackWebhook.startsWith('https://hooks.slack.com')) {
          addToast("Error: Please enter a valid Slack Webhook URL.", 'error');
          setIsTestingSlack(false);
          return;
      }
      addToast(`A test notification has been sent to your Slack channel.`, 'success');
      setIsTestingSlack(false);
    }, 1500);
  };

  return (
    <div className="h-full w-full max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-dark-text dark:text-white font-heading">Notifications</h1>
        <p className="mt-2 text-medium-dark-text dark:text-medium-text">
          Manage how you receive alerts about security vulnerabilities and repository activity.
        </p>
      </div>

       <div className={`p-4 rounded-lg flex items-start space-x-3 ${
           botStatus === 'live' ? 'bg-green-100 dark:bg-green-900/40 border-l-4 border-green-500' :
           botStatus === 'simulation' ? 'bg-yellow-100 dark:bg-yellow-900/40 border-l-4 border-yellow-500' :
           'bg-gray-100 dark:bg-gray-700/40 border-l-4 border-gray-500'
       }`}>
           <InfoIcon className={`w-6 h-6 flex-shrink-0 mt-1 ${
               botStatus === 'live' ? 'text-green-500' : botStatus === 'simulation' ? 'text-yellow-500' : 'text-gray-500'
           }`} />
           <div>
              <h3 className="font-bold text-dark-text dark:text-white">
                { botStatus === 'live' && 'Email Service: Live Mode' }
                { botStatus === 'simulation' && 'Email Service: Simulation Mode' }
                { botStatus === 'disconnected' && 'Email Service: Disconnected' }
              </h3>
              <p className="text-sm text-medium-dark-text dark:text-medium-text mt-1">
                { botStatus === 'live' && 'The bot server is running and configured to send real emails.' }
                { botStatus === 'simulation' && 'The bot server is running, but no email provider is configured. No real emails will be sent. See server logs for setup instructions.' }
                { botStatus === 'disconnected' && 'Could not connect to the bot server. All actions will be simulated. See the User Guide for setup instructions.' }
              </p>
           </div>
       </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Channels Configuration */}
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-dark-text dark:text-white font-heading">Channels</h2>
            {/* Email Card */}
            <div className="glass-effect p-6 rounded-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <MailIcon className="w-6 h-6 text-brand-cyan" />
                        <h3 className="text-lg font-semibold text-dark-text dark:text-white">Email Notifications</h3>
                    </div>
                    <ToggleSwitch enabled={emailEnabled} setEnabled={setEmailEnabled} />
                </div>
                <div className={`mt-4 pt-4 border-t border-gray-200 dark:border-white/10 transition-opacity ${emailEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                    <label htmlFor="email-address" className="block text-sm font-medium text-medium-dark-text dark:text-medium-text mb-2">
                        Send to Email
                    </label>
                    <input
                        id="email-address" type="email"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        disabled={!emailEnabled}
                        className="w-full bg-light-primary dark:bg-dark-primary border border-gray-300 dark:border-white/10 rounded-md p-2 text-sm text-dark-text dark:text-light-text focus:outline-none focus:ring-2 focus:ring-brand-purple disabled:bg-gray-200 dark:disabled:bg-white/5"
                    />
                    <button onClick={handleSendTestEmail} disabled={!emailEnabled || isTestingEmail} className="btn-secondary text-sm mt-3 py-1.5 px-3 w-32 text-center disabled:opacity-50">
                        {isTestingEmail ? <SpinnerIcon className="w-4 h-4 mx-auto" /> : 'Send Test Email'}
                    </button>
                </div>
            </div>

            {/* Slack Card */}
            <div className="glass-effect p-6 rounded-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <SlackIcon className="w-6 h-6 text-[#4A154B] dark:text-[#ECB22E]" />
                        <h3 className="text-lg font-semibold text-dark-text dark:text-white">Slack Notifications</h3>
                    </div>
                    <ToggleSwitch enabled={slackEnabled} setEnabled={setSlackEnabled} />
                </div>
                <div className={`mt-4 pt-4 border-t border-gray-200 dark:border-white/10 transition-opacity ${slackEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                    <label htmlFor="slack-webhook" className="block text-sm font-medium text-medium-dark-text dark:text-medium-text mb-2">
                        Slack Webhook URL
                    </label>
                    <input
                        id="slack-webhook" type="text"
                        placeholder="https://hooks.slack.com/services/..."
                        value={slackWebhook}
                        onChange={(e) => setSlackWebhook(e.target.value)}
                        disabled={!slackEnabled}
                        className="w-full bg-light-primary dark:bg-dark-primary border border-gray-300 dark:border-white/10 rounded-md p-2 text-sm text-dark-text dark:text-light-text focus:outline-none focus:ring-2 focus:ring-brand-purple disabled:bg-gray-200 dark:disabled:bg-white/5"
                    />
                     <button onClick={handleSendTestSlack} disabled={!slackEnabled || isTestingSlack} className="btn-secondary text-sm mt-3 py-1.5 px-3 w-36 text-center disabled:opacity-50">
                        {isTestingSlack ? <SpinnerIcon className="w-4 h-4 mx-auto" /> : 'Send Test Message'}
                    </button>
                </div>
            </div>
        </div>

        {/* Recent Activity */}
        <div>
            <h2 className="text-2xl font-bold text-dark-text dark:text-white font-heading mb-6">Recent Activity</h2>
            <div className="glass-effect p-6 rounded-lg">
                <ul className="space-y-4">
                    {mockNotifications.map(notif => (
                        <li key={notif.id} className="flex items-start space-x-4 pb-4 border-b border-gray-200 dark:border-white/10 last:border-b-0 last:pb-0">
                            <div className="mt-1">{notif.icon}</div>
                            <div className="flex-grow">
                                <p className="text-dark-text dark:text-light-text">{notif.text}</p>
                            </div>
                            <span className="text-xs text-medium-dark-text dark:text-medium-text flex-shrink-0">{notif.time}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsDashboard;