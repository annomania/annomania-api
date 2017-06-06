export function isNumber(obj) {
  return !isNaN(parseFloat(obj)) && isFinite(obj);
}

export function isPositiveInteger(num) {
  return Number.isInteger(num) && num >= 0;
}

export function isUserSetOwner(user, set) {
  return set.owner.equals(user._id);
}
