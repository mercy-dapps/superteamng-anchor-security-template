pub fn calculate_vested_amount(
    total: u64,
    start: i64,
    end: i64,
    now: i64,
) -> u64 {
    if now <= start {
        0
    } else if now >= end {
        total
    } else {
        let elapsed = now - start;
        let duration = end - start;
        ((total as u128 * elapsed as u128) / duration as u128) as u64
    }
}