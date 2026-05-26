interface ImageSelector
{
    request(prompt: string): Promise<string>;
}