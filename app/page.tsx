"use client";

import { Header, Footer, InitiationForm, ActiveSession, BreakSession } from "@/components";
import { useSession, useDuration, useSubject, useBlocklist } from "@/hooks";

export default function LockInPage() {
  const {
    session,
    loading,
    error,
    mounted,
    handleStart,
    handleStop,
    handleStartBreak,
    handleStopBreak,
  } = useSession();
  const {
    hours,
    minutes,
    seconds,
    activePreset,
    handleChange,
    handleBlur,
    setPreset,
    getTotalSeconds,
    presets,
  } = useDuration();
  const { subject, updateSubject } = useSubject();
  const { blocklist, addDomain, removeDomain } = useBlocklist();

  const onStart = () => {
    handleStart(subject, getTotalSeconds(), blocklist);
  };

  const onStartBreak = (breakSec: number) => {
    handleStartBreak(breakSec, subject, getTotalSeconds(), blocklist);
  };

  if (!mounted) return null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-black text-white font-mono">
      <div className="w-full max-w-md space-y-12">
        <Header status={session.status} />

        {session.status === 'IDLE' && (
          <InitiationForm
            subject={subject}
            onSubjectChange={updateSubject}
            hours={hours}
            minutes={minutes}
            seconds={seconds}
            activePreset={activePreset}
            presets={presets}
            onPresetSelect={setPreset}
            onDurationChange={handleChange}
            onDurationBlur={handleBlur}
            blocklist={blocklist}
            onAddDomain={addDomain}
            onRemoveDomain={removeDomain}
            onStart={onStart}
            onStartBreak={onStartBreak}
            loading={loading}
            error={error}
          />
        )}

        {session.status === 'FOCUSING' && (
          <ActiveSession
            subject={session.subject!}
            endTime={session.endTime!}
            durationSec={session.durationSec!}
            blocklist={session.blocklist || []}
            loading={loading}
            onStop={handleStop}
          />
        )}

        {session.status === 'BREAK' && (
          <BreakSession
            nextSubject={session.nextSession?.subject || "Next Session"}
            endTime={session.endTime!}
            durationSec={session.durationSec!}
            loading={loading}
            onSkip={handleStopBreak}
          />
        )}

        <Footer />
      </div>
    </main>
  );
}
