let desireAcknowledged = false

export function acknowledgeDesireOnce(): void {
  desireAcknowledged = true
}

export function consumeDesireAcknowledgement(): boolean {
  const wasAcknowledged = desireAcknowledged
  desireAcknowledged = false
  return wasAcknowledged
}
