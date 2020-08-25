/**
 * declare this typing for reading json file data with typescript
 */
declare module "*.json" {
    const value: any;
    export default value;
}